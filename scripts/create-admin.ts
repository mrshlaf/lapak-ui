import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' }); // fallback

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from 'bcryptjs';

// Re-create the prisma client here manually to avoid the issue with lib/prisma.ts if envs aren't properly mapped
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('aby.12345678', 12);
  
  // Upsert to create or update
  const admin = await prisma.user.upsert({
    where: { email: 'aby@ui.ac.id' },
    update: {
      passwordHash: hashedPassword,
      role: 'admin',
    },
    create: {
      email: 'aby@ui.ac.id',
      passwordHash: hashedPassword,
      name: 'Aby Admin',
      faculty: 'Fakultas Ilmu Komputer',
      role: 'admin',
    },
  });

  console.log('Admin user created successfully:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
