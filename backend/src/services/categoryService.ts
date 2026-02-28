import { GraphQLError } from "graphql";

import { prisma } from "../lib/prisma";
import {
  isUniqueConstraintError,
  normalizeRequiredText,
  throwBadUserInput,
} from "../utils/validation";

export async function listCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCategory(input: { name: string }, userId: string) {
  const categoryName = normalizeRequiredText(input.name, "Category name", {
    minLength: 2,
    maxLength: 50,
  });

  try {
    return await prisma.category.create({
      data: {
        name: categoryName,
        userId,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throwBadUserInput("Category name is already in use.");
    }

    throw new GraphQLError("Could not create category.", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
}

export async function updateCategory(
  input: { id: string; name: string },
  userId: string,
) {
  const categoryId = normalizeRequiredText(input.id, "Category ID");
  const categoryName = normalizeRequiredText(input.name, "Category name", {
    minLength: 2,
    maxLength: 50,
  });

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!category) {
    throw new GraphQLError("Category not found.", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  try {
    return await prisma.category.update({
      where: { id: category.id },
      data: { name: categoryName },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throwBadUserInput("Category name is already in use.");
    }

    throw error;
  }
}

export async function deleteCategory(id: string, userId: string) {
  const categoryId = normalizeRequiredText(id, "Category ID");
  const deleted = await prisma.category.deleteMany({
    where: { id: categoryId, userId },
  });

  return deleted.count > 0;
}
