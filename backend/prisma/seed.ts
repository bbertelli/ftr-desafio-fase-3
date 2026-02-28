import "dotenv/config";

import bcrypt from "bcryptjs";
import { TransactionType } from "@prisma/client";

import { prisma } from "../src/lib/prisma";

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const user = await prisma.user.upsert({
    where: { email: "seed.user@financy.dev" },
    update: {
      name: "Seed User",
      passwordHash,
    },
    create: {
      name: "Seed User",
      email: "seed.user@financy.dev",
      passwordHash,
    },
  });

  const foodCategory = await prisma.category.upsert({
    where: {
      name_userId: {
        name: "Food",
        userId: user.id,
      },
    },
    update: {},
    create: {
      name: "Food",
      userId: user.id,
    },
  });

  const salaryCategory = await prisma.category.upsert({
    where: {
      name_userId: {
        name: "Salary",
        userId: user.id,
      },
    },
    update: {},
    create: {
      name: "Salary",
      userId: user.id,
    },
  });

  await prisma.transaction.deleteMany({
    where: { userId: user.id },
  });

  await prisma.transaction.createMany({
    data: [
      {
        title: "Monthly salary",
        amount: 5000,
        type: TransactionType.INCOME,
        date: new Date(),
        notes: "Seed income transaction",
        userId: user.id,
        categoryId: salaryCategory.id,
      },
      {
        title: "Lunch",
        amount: 35.5,
        type: TransactionType.EXPENSE,
        date: new Date(),
        notes: "Seed expense transaction",
        userId: user.id,
        categoryId: foodCategory.id,
      },
    ],
  });

  console.log("Seed completed.");
  console.log("User:", user.email);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
