import "dotenv/config";

import cors from "cors";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { Prisma, TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { GraphQLError, GraphQLScalarType, Kind } from "graphql";

import { generateToken, verifyToken } from "./auth";
import { prisma } from "./lib/prisma";

type GraphQLContext = {
  userId: string | null;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 72;

const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  description: "DateTime scalar serialized as ISO string",
  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === "string") {
      return value;
    }

    throw new TypeError("DateTime serialization expects a Date or ISO string.");
  },
  parseValue(value: unknown): Date {
    if (typeof value !== "string") {
      throw new TypeError("DateTime value must be a string.");
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new TypeError("Invalid DateTime value.");
    }

    return parsed;
  },
  parseLiteral(ast): Date {
    if (ast.kind !== Kind.STRING) {
      throw new TypeError("DateTime literal must be a string.");
    }

    const parsed = new Date(ast.value);

    if (Number.isNaN(parsed.getTime())) {
      throw new TypeError("Invalid DateTime literal.");
    }

    return parsed;
  },
});

function getUserIdOrThrow(context: GraphQLContext): string {
  if (!context.userId) {
    throw new GraphQLError("Authentication required.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  return context.userId;
}

function throwBadUserInput(message: string): never {
  throw new GraphQLError(message, {
    extensions: { code: "BAD_USER_INPUT" },
  });
}

function normalizeRequiredText(
  value: string,
  field: string,
  options?: { minLength?: number; maxLength?: number },
): string {
  const normalized = value.trim();
  const minLength = options?.minLength ?? 1;
  const maxLength = options?.maxLength;

  if (normalized.length < minLength) {
    throwBadUserInput(`${field} must contain at least ${minLength} character(s).`);
  }

  if (maxLength !== undefined && normalized.length > maxLength) {
    throwBadUserInput(`${field} must contain at most ${maxLength} character(s).`);
  }

  return normalized;
}

function normalizeOptionalText(value?: string | null): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function normalizeAndValidateEmail(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (!EMAIL_REGEX.test(normalized)) {
    throwBadUserInput("Email is invalid.");
  }

  return normalized;
}

function validatePassword(password: string): string {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throwBadUserInput(
      `Password must contain at least ${MIN_PASSWORD_LENGTH} character(s).`,
    );
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    throwBadUserInput(
      `Password must contain at most ${MAX_PASSWORD_LENGTH} character(s).`,
    );
  }

  return password;
}

function validateAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    throwBadUserInput("Amount must be a number greater than zero.");
  }

  return amount;
}

function ensureValidDate(value: Date): Date {
  if (Number.isNaN(value.getTime())) {
    throwBadUserInput("Date is invalid.");
  }

  return value;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

const typeDefs = `#graphql
  scalar DateTime

  enum TransactionType {
    INCOME
    EXPENSE
  }

  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Category {
    id: ID!
    name: String!
    userId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Transaction {
    id: ID!
    title: String!
    amount: Float!
    type: TransactionType!
    date: DateTime!
    notes: String
    userId: ID!
    categoryId: ID
    category: Category
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input SignupInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateCategoryInput {
    name: String!
  }

  input UpdateCategoryInput {
    id: ID!
    name: String!
  }

  input CreateTransactionInput {
    title: String!
    amount: Float!
    type: TransactionType!
    date: DateTime!
    notes: String
    categoryId: ID
  }

  input UpdateTransactionInput {
    id: ID!
    title: String
    amount: Float
    type: TransactionType
    date: DateTime
    notes: String
    categoryId: ID
  }

  type Query {
    health: String!
    me: User!
    categories: [Category!]!
    transactions: [Transaction!]!
  }

  type Mutation {
    signup(input: SignupInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
    createTransaction(input: CreateTransactionInput!): Transaction!
    updateTransaction(input: UpdateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }
`;

const resolvers = {
  DateTime: DateTimeScalar,
  Query: {
    health: () => "Financy backend is running",
    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = getUserIdOrThrow(context);

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new GraphQLError("Authenticated user was not found.");
      }

      return user;
    },
    categories: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ) => {
      const userId = getUserIdOrThrow(context);

      return prisma.category.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    },
    transactions: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ) => {
      const userId = getUserIdOrThrow(context);

      return prisma.transaction.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { date: "desc" },
      });
    },
  },
  Mutation: {
    signup: async (
      _parent: unknown,
      args: { input: { name: string; email: string; password: string } },
    ) => {
      const { name, email, password } = args.input;
      const normalizedName = normalizeRequiredText(name, "Name", {
        minLength: 2,
        maxLength: 80,
      });
      const normalizedEmail = normalizeAndValidateEmail(email);
      const validatedPassword = validatePassword(password);

      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        throw new GraphQLError("Email is already in use.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const hashedPassword = await bcrypt.hash(validatedPassword, 10);

      const user = await prisma.user.create({
        data: {
          name: normalizedName,
          email: normalizedEmail,
          passwordHash: hashedPassword,
        },
      });

      return {
        token: generateToken(user.id),
        user,
      };
    },
    login: async (
      _parent: unknown,
      args: { input: { email: string; password: string } },
    ) => {
      const { email, password } = args.input;
      const normalizedEmail = normalizeAndValidateEmail(email);
      const validatedPassword = normalizeRequiredText(password, "Password", {
        minLength: 1,
      });

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        throw new GraphQLError("Invalid credentials.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const isPasswordValid = await bcrypt.compare(
        validatedPassword,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        throw new GraphQLError("Invalid credentials.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      return {
        token: generateToken(user.id),
        user,
      };
    },
    createCategory: async (
      _parent: unknown,
      args: { input: { name: string } },
      context: GraphQLContext,
    ) => {
      const userId = getUserIdOrThrow(context);
      const categoryName = normalizeRequiredText(args.input.name, "Category name", {
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
    },
    updateCategory: async (
      _parent: unknown,
      args: { input: { id: string; name: string } },
      context: GraphQLContext,
    ) => {
      const userId = getUserIdOrThrow(context);
      const { id, name } = args.input;
      const categoryId = normalizeRequiredText(id, "Category ID");
      const categoryName = normalizeRequiredText(name, "Category name", {
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
    },
    deleteCategory: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      const userId = getUserIdOrThrow(context);
      const categoryId = normalizeRequiredText(args.id, "Category ID");

      const deleted = await prisma.category.deleteMany({
        where: { id: categoryId, userId },
      });

      return deleted.count > 0;
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
      const { title, amount, type, date, notes, categoryId } = args.input;
      const normalizedTitle = normalizeRequiredText(title, "Transaction title", {
        minLength: 2,
        maxLength: 100,
      });
      const validatedAmount = validateAmount(amount);
      const validatedDate = ensureValidDate(date);
      const normalizedNotes = normalizeOptionalText(notes);
      let normalizedCategoryId: string | null = null;

      if (categoryId) {
        normalizedCategoryId = normalizeRequiredText(categoryId, "Category ID");
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
          type,
          date: validatedDate,
          notes: normalizedNotes ?? null,
          userId,
          categoryId: normalizedCategoryId,
        },
        include: { category: true },
      });
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
      const { input } = args;
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
    },
    deleteTransaction: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      const userId = getUserIdOrThrow(context);
      const transactionId = normalizeRequiredText(args.id, "Transaction ID");

      const deleted = await prisma.transaction.deleteMany({
        where: { id: transactionId, userId },
      });

      return deleted.count > 0;
    },
  },
};

async function bootstrap() {
  const app = express();
  const port = Number(process.env.PORT ?? 4000);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(cors());
  app.use(express.json());
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith("Bearer ")
          ? authHeader.slice("Bearer ".length)
          : null;

        if (!token) {
          return { userId: null };
        }

        try {
          const payload = verifyToken(token);

          return { userId: payload.userId };
        } catch {
          throw new GraphQLError("Invalid or expired token.", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }
      },
    }),
  );

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/graphql`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
