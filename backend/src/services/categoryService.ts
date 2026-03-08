import { GraphQLError } from "graphql";

import { prisma } from "../lib/prisma";
import {
  isUniqueConstraintError,
  normalizeRequiredText,
  throwBadUserInput,
} from "../utils/validation";

const ALLOWED_CATEGORY_COLORS = new Set([
  "blue",
  "purple",
  "pink",
  "orange",
  "yellow",
  "green",
  "red",
]);

const ALLOWED_CATEGORY_ICONS = new Set([
  "utensils",
  "car-front",
  "house",
  "heart-pulse",
  "dumbbell",
  "shopping-cart",
  "briefcase-business",
  "ticket",
  "gift",
  "tool-case",
  "baggage-claim",
  "book-open",
  "receipt-text",
  "paw-print",
  "piggy-bank",
  "mailbox",
]);

export async function listCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCategory(
  input: { name: string; description: string; icon: string; color: string },
  userId: string,
) {
  const categoryName = normalizeRequiredText(input.name, "Category name", {
    minLength: 2,
    maxLength: 50,
  });
  const categoryDescription = normalizeRequiredText(
    input.description,
    "Category description",
    {
      minLength: 3,
      maxLength: 120,
    },
  );
  const categoryIcon = normalizeRequiredText(input.icon, "Category icon");
  const categoryColor = normalizeRequiredText(input.color, "Category color");

  if (!ALLOWED_CATEGORY_ICONS.has(categoryIcon)) {
    throwBadUserInput("Category icon is invalid.");
  }

  if (!ALLOWED_CATEGORY_COLORS.has(categoryColor)) {
    throwBadUserInput("Category color is invalid.");
  }

  try {
    return await prisma.category.create({
      data: {
        name: categoryName,
        description: categoryDescription,
        icon: categoryIcon,
        color: categoryColor,
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
  input: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  },
  userId: string,
) {
  const categoryId = normalizeRequiredText(input.id, "Category ID");
  const categoryName = normalizeRequiredText(input.name, "Category name", {
    minLength: 2,
    maxLength: 50,
  });
  const categoryDescription = normalizeRequiredText(
    input.description,
    "Category description",
    {
      minLength: 3,
      maxLength: 120,
    },
  );
  const categoryIcon = normalizeRequiredText(input.icon, "Category icon");
  const categoryColor = normalizeRequiredText(input.color, "Category color");

  if (!ALLOWED_CATEGORY_ICONS.has(categoryIcon)) {
    throwBadUserInput("Category icon is invalid.");
  }

  if (!ALLOWED_CATEGORY_COLORS.has(categoryColor)) {
    throwBadUserInput("Category color is invalid.");
  }

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
      data: {
        name: categoryName,
        description: categoryDescription,
        icon: categoryIcon,
        color: categoryColor,
      },
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
