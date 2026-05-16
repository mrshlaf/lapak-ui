import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany();
  const products = await prisma.product.findMany();
  const productImages = await prisma.productImage.findMany();
  const posts = await prisma.post.findMany();
  const comments = await prisma.comment.findMany();

  let sql = "-- Lapak UI Database Dump (Dummy Data)\\n\\n";

  sql += "-- Users\\n";
  for (const u of users) {
    sql += `INSERT INTO users (id, name, email, password_hash, faculty, profile_picture, role) VALUES ('${u.id}', '${u.name.replace(/'/g, "''")}', '${u.email}', '${u.passwordHash}', '${u.faculty}', '${u.profilePicture}', '${u.role}');\\n`;
  }

  sql += "\\n-- Products\\n";
  for (const p of products) {
    sql += `INSERT INTO products (id, seller_id, title, description, price, is_negotiable, category, sub_category, condition, cod_location, faculty_location) VALUES ('${p.id}', '${p.sellerId}', '${p.title.replace(/'/g, "''")}', '${(p.description || "").replace(/'/g, "''")}', ${p.price}, ${p.isNegotiable}, '${p.category}', '${p.subCategory}', '${p.condition}', '${p.codLocation}', '${p.facultyLocation}');\\n`;
  }

  sql += "\\n-- Product Images\\n";
  for (const img of productImages) {
    sql += `INSERT INTO product_images (id, product_id, image_url, is_primary) VALUES ('${img.id}', '${img.productId}', '${img.imageUrl}', ${img.isPrimary});\\n`;
  }

  sql += "\\n-- Posts\\n";
  for (const p of posts) {
    sql += `INSERT INTO posts (id, author_id, content) VALUES ('${p.id}', '${p.authorId}', '${p.content.replace(/'/g, "''")}');\\n`;
  }

  sql += "\\n-- Comments\\n";
  for (const c of comments) {
    sql += `INSERT INTO comments (id, post_id, author_id, content) VALUES ('${c.id}', '${c.postId}', '${c.authorId}', '${c.content.replace(/'/g, "''")}');\\n`;
  }

  fs.writeFileSync("prisma/seed.sql", sql);
  console.log("Successfully generated prisma/seed.sql");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
