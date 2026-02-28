import { TransactionType } from "@prisma/client";
import { GraphQLError } from "graphql";

import { prisma } from "../lib/prisma";
import {
  ensureValidDate,
  normalizeOptionalText,
  normalizeRequiredText,
  throwBadUserInput,
  validateAmount,
} from "../utils/validation";

type CreateTransactionInput = {
  title: string;
  amount: number;
  type: TransactionType;
  date: Date;
  notes?: string | null;
  categoryId?: string | null;
};

type UpdateTransactionInput = {
  id: string;
  title?: string;
  amount?: number;
  type?: TransactionType;
  date?: Date;
  notes?: string | null;
  categoryId?: string | null;
};

export async function listTransactions(userId: string) {
  return prisma.transaction.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: "desc" },
  });
}

export async function createTransaction(
  input: CreateTransactionInput,
  userId: string,
) {
  const normalizedTitle = normalizeRequiredText(input.title, "Transaction title", {
    minLength: 2,
    maxLength: 100,
  });
  const validatedAmount = validateAmount(input.amount);
  const validatedDate = ensureValidDate(input.date);
  const normalizedNotes = normalizeOptionalText(input.notes);
  let normalizedCategoryId: string | null = null;

  if (input.categoryId) {
    normalizedCategoryId = normalizeRequiredText(input.categoryId, "Category ID");
    const category = await prisma.category.findFirst({
      where: { id: normalizedCategoryId, userId },
    });

    if (!category) {
      throw new GraphQLError("Category not found.", {
        extensions: { code: "NOT_FOUND" },
      });
    }
  }

  return prisma.transaction.create({
    data: {
      title: normalizedTitle,
      amount: validatedAmount,
      type: input.type,
      date: validatedDate,
      notes: normalizedNotes ?? null,
      userId,
      categoryId: normalizedCategoryId,
    },
    include: { category: true },
  });
}

export async function updateTransaction(
  input: UpdateTransactionInput,
  userId: string,
) {
  const transactionId = normalizeRequiredText(input.id, "Transaction ID");
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  });

  if (!transaction) {
    throw new GraphQLError("Transaction not found.", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const hasCategoryUpdate = Object.prototype.hasOwnProperty.call(
    input,
    "categoryId",
  );
  let normalizedCategoryId: string | null | undefined = undefined;

  if (hasCategoryUpdate && input.categoryId) {
    normalizedCategoryId = normalizeRequiredText(input.categoryId, "Category ID");
    const category = await prisma.category.findFirst({
      where: { id: normalizedCategoryId, userId },
    });

    if (!category) {
      throw new GraphQLError("Category not found.", {
        extensions: { code: "NOT_FOUND" },
      });
    }
  }

  if (hasCategoryUpdate && input.categoryId === null) {
    normalizedCategoryId = null;
  }

  const normalizedTitle =
    input.title !== undefined
      ? normalizeRequiredText(input.title, "Transaction title", {
          minLength: 2,
          maxLength: 100,
        })
      : undefined;
  const validatedAmount =
    input.amount !== undefined ? validateAmount(input.amount) : undefined;
  const validatedDate =
    input.date !== undefined ? ensureValidDate(input.date) : undefined;
  const normalizedNotes = normalizeOptionalText(input.notes);

  if (
    normalizedTitle === undefined &&
    validatedAmount === undefined &&
    input.type === undefined &&
    validatedDate === undefined &&
    normalizedNotes === undefined &&
    !hasCategoryUpdate
  ) {
    throwBadUserInput("At least one field must be provided to update.");
  }

  return prisma.transaction.update({
    where: { id: transactionId },
    data: {
      title: normalizedTitle,
      amount: validatedAmount,
      type: input.type,
      date: validatedDate,
      notes: Object.prototype.hasOwnProperty.call(input, "notes")
        ? normalizedNotes
        : undefined,
      categoryId: hasCategoryUpdate ? normalizedCategoryId : undefined,
    },
    include: { category: true },
  });
}

export async function deleteTransaction(id: string, userId: string) {
  const transactionId = normalizeRequiredText(id, "Transaction ID");
  const deleted = await prisma.transaction.deleteMany({
    where: { id: transactionId, userId },
  });

  return deleted.count > 0;
}
