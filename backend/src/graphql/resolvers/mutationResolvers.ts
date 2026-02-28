import { TransactionType } from "@prisma/client";

import type { GraphQLContext } from "../context";
import { login, signup } from "../../services/authService";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../../services/categoryService";
import { getUserIdOrThrow } from "../../services/serviceHelpers";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "../../services/transactionService";

export const mutationResolvers = {
  signup: async (
    _parent: unknown,
    args: { input: { name: string; email: string; password: string } },
  ) => signup(args.input),

  login: async (
    _parent: unknown,
    args: { input: { email: string; password: string } },
  ) => login(args.input),

  createCategory: async (
    _parent: unknown,
    args: { input: { name: string } },
    context: GraphQLContext,
  ) => {
    const userId = getUserIdOrThrow(context);

    return createCategory(args.input, userId);
  },

  updateCategory: async (
    _parent: unknown,
    args: { input: { id: string; name: string } },
    context: GraphQLContext,
  ) => {
    const userId = getUserIdOrThrow(context);

    return updateCategory(args.input, userId);
  },

  deleteCategory: async (
    _parent: unknown,
    args: { id: string },
    context: GraphQLContext,
  ) => {
    const userId = getUserIdOrThrow(context);

    return deleteCategory(args.id, userId);
  },

  createTransaction: async (
    _parent: unknown,
    args: {
      input: {
        title: string;
        amount: number;
        type: TransactionType;
        date: Date;
        notes?: string | null;
        categoryId?: string | null;
      };
    },
    context: GraphQLContext,
  ) => {
    const userId = getUserIdOrThrow(context);

    return createTransaction(args.input, userId);
  },

  updateTransaction: async (
    _parent: unknown,
    args: {
      input: {
        id: string;
        title?: string;
        amount?: number;
        type?: TransactionType;
        date?: Date;
        notes?: string | null;
        categoryId?: string | null;
      };
    },
    context: GraphQLContext,
  ) => {
    const userId = getUserIdOrThrow(context);

    return updateTransaction(args.input, userId);
  },

  deleteTransaction: async (
    _parent: unknown,
    args: { id: string },
    context: GraphQLContext,
  ) => {
    const userId = getUserIdOrThrow(context);

    return deleteTransaction(args.id, userId);
  },
};
