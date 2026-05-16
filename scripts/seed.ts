import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const FACULTIES = [
  "Fakultas Ilmu Komputer", "Fakultas Hukum", "Fakultas Teknik", 
  "Fakultas Kedokteran", "Fakultas Ekonomi Dan Bisnis", "Fakultas Psikologi", 
  "Fakultas Ilmu Administrasi", "Program Pendidikan Vokasi", 
  "Fakultas Ilmu Pengetahuan Budaya", "Fakultas Kesehatan Masyarakat",
  "Fakultas Kedokteran Gigi", "Fakultas Matematika Dan Ilmu Pengetahuan Alam",
  "Fakultas Ilmu Sosial dan Ilmu Politik", "Fakultas Ilmu Keperawatan"
];

async function main() {
  console.log("MENGHAPUS SEMUA DATA LAMA...");
  // Clear the database completely
  await prisma.postImage.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.message.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding MORE dummy data Anak UI with real photos...");

  // Generate 20 Users
  const users = [];
  const names = [
    "Alya", "Bima", "Cinta", "Dika", "Elsa", "Fikri", "Gita", "Hadi", "Intan", "Jojo",
    "Kiki", "Lila", "Rangga", "Nina", "Omar", "Putri", "Qori", "Rama", "Sinta", "Tomi"
  ];
  
  for (let i = 0; i < 20; i++) {
    const passwordHash = await bcrypt.hash("ui12345", 10);
    const email = `${names[i].toLowerCase()}.${Math.floor(Math.random() * 1000)}@ui.ac.id`;
    const user = await prisma.user.create({
      data: {
        name: names[i],
        email,
        passwordHash,
        faculty: FACULTIES[i % FACULTIES.length],
        profilePicture: `https://ui-avatars.com/api/?name=${names[i]}&background=random`,
        role: "user"
      }
    });
    users.push(user);
  }
  console.log(`Created 20 users.`);

  // Add 25 Products with real photos
  const productsData = [
    { title: "Alat Press Grill Elektrik (Kira)", desc: "BU banget nih jual murah alat press grill elektrik (merk kira) tawarin aja harganya!! (blm pernah dipake), free COD depok", price: 150000, cat: "barang", sub: "Elektronik", cond: "baru", img: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&q=80" },
    { title: "Kompor Listrik Kecil", desc: "Jual kompor listrik kecil minus pemakaian gass. Cocok buat anak kosan.", price: 100000, cat: "barang", sub: "Elektronik", cond: "bekas_normal", img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80" },
    { title: "PO Dubai Chewy Cookies", desc: "Open PO Dubai Chewy Cookies only 25k/pcs. Bisa dianter sekitaran UI dan Kutek, Yuk langsung aja order!", price: 25000, cat: "barang", sub: "Makanan", cond: "baru", img: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80" },
    { title: "Kalkulus Edisi 9 (Purcell)", desc: "Jual buku kalkulus jilid 1 edisi 9, kondisi masih mulus banget jarang kecoret, jual cepat aja BU buat print tugas akhir", price: 85000, cat: "barang", sub: "Buku", cond: "bekas_mulus", img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80" },
    { title: "Jasa Kuesioner Skripsi", desc: "Terima jasa sebar kuesioner ke anak UI, target 100 responden = 100k, dijamin valid. DM buat portofolio.", price: 100000, cat: "jasa", sub: "Lainnya", cond: "baru", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" },
    { title: "Kipas Angin Berdiri Miyako", desc: "Jual cepat kipas angin berdiri. Angin masih kenceng banget. Alasan jual karena udah lulus dan mau pindahan.", price: 60000, cat: "barang", sub: "Elektronik", cond: "bekas_normal", img: "https://images.unsplash.com/photo-1618220179428-22790b46a011?w=800&q=80" },
    { title: "Jas Lab UI Ukuran M", desc: "Dijual jas lab UI ukuran M, jarang dipake cuma buat praktikum maba aja. Bersih no noda.", price: 50000, cat: "barang", sub: "Pakaian", cond: "bekas_mulus", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80" },
    { title: "Kemeja Flannel Uniqlo", desc: "Flannel uniqlo cowok size L, warna merah item, dipake ngampus doang masih bagus bgt.", price: 120000, cat: "barang", sub: "Pakaian", cond: "bekas_normal", img: "https://images.unsplash.com/photo-1596755094514-f87e32f6b474?w=800&q=80" },
    { title: "Jasa Titip (Jastip) Kober", desc: "Jastip kober margonda nih yang mau nitip makan siang, fee 5k per item aja. Chat aja mau menu apa.", price: 5000, cat: "jasa", sub: "Makanan", cond: "baru", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80" },
    { title: "Kalkulator Scientific Casio FX-991", desc: "Kalkulator sakti anak teknik, casio fx-991EX. Fungsi normal semua, bonus cover.", price: 180000, cat: "barang", sub: "Elektronik", cond: "bekas_mulus", img: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&q=80" },
    { title: "Sepatu Vans Old Skool Original", desc: "Vans old skool hitam putih original size 42. Minus pemakaian aja kotor dikit, sol aman. COD stasiun UI", price: 300000, cat: "barang", sub: "Pakaian", cond: "bekas_normal", img: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80" },
    { title: "Buku Makroekonomi Mankiw", desc: "Buku wajib anak FEB. Makroekonomi edisi 8 terjemahan. Ada highlight stabilo di bab awal.", price: 75000, cat: "barang", sub: "Buku", cond: "bekas_normal", img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80" },
    { title: "Rice Cooker Cosmos 0.6L", desc: "Rice cooker kecil buat di kosan, muat buat 1-2 orang. Dus masih ada. Dijual karena mau lulus.", price: 100000, cat: "barang", sub: "Elektronik", cond: "bekas_mulus", img: "https://images.unsplash.com/photo-1585238341210-0414907ee94f?w=800&q=80" },
    { title: "Tote Bag Kanvas Polos", desc: "Tote bag bahan tebel, cocok buat bawa laptop & buku. Warna broken white.", price: 35000, cat: "barang", sub: "Pakaian", cond: "baru", img: "https://images.unsplash.com/photo-1597484661643-2f5fef640df1?w=800&q=80" },
    { title: "Jasa Pembuatan PPT Aesthetic", desc: "Pusing bikin PPT presentasi? Jasa desain PPT estetik, pengerjaan cepet 1-2 hari kelar. Harga tergantung slide.", price: 50000, cat: "jasa", sub: "Lainnya", cond: "baru", img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80" },
    { title: "Kacamata Antiradiasi", desc: "Kacamata antiradiasi buat yg sering depan laptop, frame bening. Belum pernah dipake karena kegedean.", price: 40000, cat: "barang", sub: "Lainnya", cond: "baru", img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80" },
    { title: "Tumbler Corkcicle ORI", desc: "Corkcicle Canteen 16oz warna matte black. Ori ada box. Minus lecet dikit di bawah.", price: 450000, cat: "barang", sub: "Lainnya", cond: "bekas_normal", img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80" },
    { title: "Buku SBD Database Systems", desc: "Database System Concepts edisi terbaru. Pas buat yg ambil matkul SBD atau Basis Data Fasilkom.", price: 150000, cat: "barang", sub: "Buku", cond: "bekas_mulus", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" },
    { title: "Meja Lipat Belajar", desc: "Meja lipat kayu buat di kasur kosan, ada slot buat naruh minum & iPad. Kondisi 90%.", price: 45000, cat: "barang", sub: "Lainnya", cond: "bekas_normal", img: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&q=80" },
    { title: "Mouse Wireless Logitech M170", desc: "Mouse logitech wireless, baterai awet bgt. Klik masih empuk. Bonus baterai A2 baru.", price: 70000, cat: "barang", sub: "Elektronik", cond: "bekas_mulus", img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80" },
    { title: "Keyboard Mechanical Rexus", desc: "Keyboard mechanical rexus daxa, switch red. Suara thock. RGB nyala semua.", price: 350000, cat: "barang", sub: "Elektronik", cond: "bekas_normal", img: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80" },
    { title: "Jaket Kuning (Makara) Size L", desc: "WTS Jakun UI ukuran L, kondisi msh bagus bgt jarang upacara wkwk. Beli pas maba doang.", price: 90000, cat: "barang", sub: "Pakaian", cond: "bekas_mulus", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80" },
    { title: "Buku Pengantar Akuntansi", desc: "Pengantar akuntansi warren, reeve, duchac. Kertas HVS bagus. Harga bisa nego tipis.", price: 110000, cat: "barang", sub: "Buku", cond: "bekas_normal", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80" },
    { title: "Jasa Terjemah Jurnal Inggris-Indo", desc: "Menerima jasa translate jurnal dari inggris ke indonesia. Bahasa luwes gak kaku kayak google translate.", price: 30000, cat: "jasa", sub: "Lainnya", cond: "baru", img: "https://images.unsplash.com/photo-1455390582262-044cdead2708?w=800&q=80" },
    { title: "Rak Sepatu Plastik Susun", desc: "Rak sepatu susun 4 tingkat, muat banyak. Gampang dirakit. Nego ambil sendiri di kutek.", price: 30000, cat: "barang", sub: "Lainnya", cond: "bekas_normal", img: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80" }
  ];

  const codLocations = ["Kutek", "Barel", "Stasiun UI", "Stasiun Pocin", "Halte Bikun Menwa", "Perpustakaan Pusat UI"];

  for (let i = 0; i < productsData.length; i++) {
    const p = productsData[i];
    const seller = users[i % users.length];
    
    await prisma.product.create({
      data: {
        title: p.title,
        description: p.desc,
        price: p.price,
        category: p.cat,
        subCategory: p.sub,
        condition: p.cond,
        sellerId: seller.id,
        codLocation: codLocations[i % codLocations.length],
        facultyLocation: seller.faculty,
        isNegotiable: true,
        images: {
          create: {
            imageUrl: p.img,
            isPrimary: true
          }
        }
      }
    });
  }
  console.log(`Created ${productsData.length} products with REAL photos.`);

  // Create real-looking UI menfess posts
  const postsData = [
    "Halo pawfriends, saat ini kami memerlukan bantuan dari kalian untuk menekan populasi kucing di ui! dengan cara berdonasi. Sekecil apapun dananya, sangat berarti untuk kami. Terima kasih yang selalu mendukung kami!",
    "ask! Hari ini bikun beroperasional gak deh? UI!",
    "ui! Jujur puncak komedi sih MIN, ada ya organisasi sibuk ngatur ngatur fungsionaris boleh pacaran atau engga (eike kira cukup ngurus gagang rubem aja) bener bener BEM si paling ADMIN yee HAHAH",
    "struggle! ada yang punya template dokumen2 ini ga yaa? pls kalo ada boleh tolong bantu send akuu yaa aku kg mau daftar beasiswa tp dokumen2 ini gabisa diakses di web udh berhari hari",
    "hiii, buat gusy2 ui! yang cita-citanya pengen punya senyum rapi dan nyaman, atau sesuai sama kriteria dibawah, langsung hubungi kontak dibawah yaaa, bisa juga kl mau tanya-tanya duluuu. thanksss gusy!!",
    "ask! guys aku kan mau coba daftar beasiswa di web, tapi kenapa ya mau download dokumen pendukungnya yang ada di bagian bawah itu gabisa? aku dah coba pake hp dan laptop tetep gabisa, bacaannya 403 forbidden, kalo gitu gimana ya solusinya, ada yang sama kayak gitu juga gak? tia!",
    "sumpah di tiktok banyak bgt akun2 fake yg ngatasnamain kos2an sekitar ui! gimana ya cara ngasi tau orang2 kalo itu semua penipuan",
    "hii guyss sender mohon bantuannya lagi cari responden, kriterianya dari FIA UI! angkatan 2021–2023 dan pernah venting (meluapkan emosi) di X dalam 2 bulan terakhir, link nanti aku kirim lewat reply, thank uuuu",
    "ui! Info dong tempat makan siang yg murah tapi ngenyangin di area sekitar Fasilkom/FIB, dompet udh nipis akhir bulan",
    "struggle! Ya Allah cape banget ngerjain TP SBD ini kenapa postgresql error mulu dah koneksinya, ada yg jago DB gakk mau nanya pls",
    "ask! Tolong info kosan putra sekitar pocin atau kutek yg under 1jt ada gak ya? Udah nyari muter-muter pada full semua",
    "ui! Gais mau nangis barusan laptopku ketinggalan di perpus pusat lantai 2 deket macs, pas aku balik udh gaada. Tolong kalo ada yg liat dm ya, ada stiker spotify",
    "ask! Ada yg tau cara ngurus KTM ilang gak ya? Harus lapor ke polisi dulu apa lgsg ke rektorat? Thanks before",
    "struggle! Plis dosen matkul XYZ kalo ngasih tugas jangan numpuk di akhir minggu dong, cape bgt begadang muluu",
    "ui! Bikun ac nya pada mati ya hari ini? Panas bgt dari pocin ke teknik berasa sauna gratis",
    "ask! Gais tempat print yg buka 24 jam di kukusan dimana ya? Tugas hrs dikumpulin jam 7 pagi bsk mati gue belum di print",
    "ui! Congrats ya buat yg lolos SIMAK UI! Welcome to the jungle, persiapkan mental dan fisik kalian hehehe",
    "struggle! Kosan gue mati lampu dari jam 8 malem, tugas belum kelar, batre sisa 10%. Nikmat mana lagi yg engkau dustakan"
  ];

  for (let i = 0; i < postsData.length; i++) {
    const author = users[i % users.length];
    const post = await prisma.post.create({
      data: {
        content: postsData[i],
        authorId: author.id
      }
    });

    // Add 1-3 comments per post
    const commentCount = (i % 3) + 1;
    for (let c = 0; c < commentCount; c++) {
      await prisma.comment.create({
        data: {
          content: [
            "Semangat kaa!", "Coba lapor ke PLK UI aja kak", "Wah sama banget, gue jg ngalamin kmrn", 
            "Gue ada nih, cek DM ya", "Titip sendal, gue jg butuh infonya", "Kalo ga salah sih ke rektorat lantai 2",
            "Sabar ya, emang lagi maintenance web nya", "Aduh turut berduka cita kak"
          ][(i + c) % 8],
          postId: post.id,
          authorId: users[(i + c + 1) % users.length].id
        }
      });
    }
  }
  console.log(`Created ${postsData.length} posts with comments.`);

  console.log("Seeding fresh dummy data complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
