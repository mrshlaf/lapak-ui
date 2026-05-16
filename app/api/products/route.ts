import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";
import { redis } from "@/lib/redis";

// GET /api/products — list dengan filter & pagination
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cacheKey = `products:${searchParams.toString()}`;

  try {
    if (redis) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return ok(JSON.parse(cachedData));
      }
    }
  } catch (e) {
    console.error("Redis error:", e);
  }

  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "12");
  const category = searchParams.get("category");
  const subCategory = searchParams.get("subCategory");
  const status = searchParams.get("status");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const faculty = searchParams.get("faculty");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") ?? "newest";

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (subCategory) where.subCategory = subCategory;
  if (status) where.status = status;
  else where.status = { in: ["available", "reserved"] };
  if (faculty) where.facultyLocation = faculty;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, number>).gte = parseInt(minPrice);
    if (maxPrice) (where.price as Record<string, number>).lte = parseInt(maxPrice);
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: Record<string, string> =
    sort === "cheapest"
      ? { price: "asc" }
      : sort === "expensive"
      ? { price: "desc" }
      : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        price: true,
        isNegotiable: true,
        category: true,
        subCategory: true,
        condition: true,
        status: true,
        facultyLocation: true,
        createdAt: true,
        seller: {
          select: { id: true, name: true, faculty: true, ratingAvg: true, profilePicture: true },
        },
        images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const responseData = { products, total, page, totalPages: Math.ceil(total / limit) };

  try {
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(responseData), "EX", 60); // Cache for 60 seconds
    }
  } catch (e) {
    console.error("Redis set error:", e);
  }

  return ok(responseData);
}

// POST /api/products — buat produk baru
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const {
      title, description, price, isNegotiable, category, subCategory,
      condition, reservationDuration, codLocation, facultyLocation, images,
    } = body;

    if (!title || price === undefined || !category) {
      return err("Judul, harga, dan kategori wajib diisi.");
    }

    const product = await prisma.product.create({
      data: {
        sellerId: session.userId,
        title,
        description,
        price: parseInt(price),
        isNegotiable: isNegotiable ?? false,
        category,
        subCategory,
        condition,
        reservationDuration: reservationDuration ?? 24,
        codLocation,
        facultyLocation,
        status: "available",
      },
    });

    // Simpan gambar jika ada
    if (images && images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((url: string, index: number) => ({
          productId: product.id,
          imageUrl: url,
          isPrimary: index === 0,
          orderIndex: index,
        })),
      });
    }

    const result = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true },
    });

    // Invalidate Redis Cache for lists and landing page
    try {
      const { delByPattern, redis } = await import("@/lib/redis");
      await delByPattern("products:*");
      if (redis) {
        await redis.del("landing:products");
      }
    } catch (e) { console.error(e); }

    return ok({ product: result }, 201);
  } catch (e) {
    console.error("[PRODUCTS POST]", e);
    return err("Terjadi kesalahan server.", 500);
  }
}
