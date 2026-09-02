import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "teacher@example.com";
  const password = "password123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Seed skipped: ${email} already exists.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const teacher = await prisma.user.create({
    data: {
      name: "ครูตัวอย่าง",
      email,
      passwordHash,
      role: "TEACHER",
    },
  });

  console.log(`Created sample teacher: ${teacher.email} / password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
