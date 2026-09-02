import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedUser(email: string, name: string, password: string, role: "ADMIN" | "TEACHER") {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Seed skipped: ${email} already exists.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  console.log(`Created ${role.toLowerCase()}: ${user.email} / password: ${password}`);
}

async function main() {
  await seedUser("admin@example.com", "ผู้ดูแลระบบ", "adminpassword123", "ADMIN");
  await seedUser("teacher@example.com", "ครูตัวอย่าง", "password123", "TEACHER");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
