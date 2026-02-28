import "dotenv/config";

import cors from "cors";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { GraphQLError, GraphQLScalarType, Kind } from "graphql";

import { generateToken, verifyToken } from "./auth";
import { prisma } from "./lib/prisma";

type GraphQLContext = {
  userId: string | null;
};

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
      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        throw new GraphQLError("Email is already in use.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
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
      const normalizedEmail = email.trim().toLowerCase();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        throw new GraphQLError("Invalid credentials.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

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

      try {
        return await prisma.category.create({
          data: {
            name: args.input.name.trim(),
            userId,
          },
        });
      } catch {
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

      const category = await prisma.category.findFirst({
        where: { id, userId },
      });

      if (!category) {
        throw new GraphQLError("Category not found.", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return prisma.category.update({
        where: { id: category.id },
        data: { name: name.trim() },
      });
    },
    deleteCategory: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      const userId = getUserIdOrThrow(context);

      const deleted = await prisma.category.deleteMany({
        where: { id: args.id, userId },
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

      if (categoryId) {
        const category = await prisma.category.findFirst({
          where: { id: categoryId, userId },
        });

        if (!category) {
          throw new GraphQLError("Category not found.", {
            extensions: { code: "NOT_FOUND" },
          });
        }
      }

      return prisma.transaction.create({
        data: {
          title: title.trim(),
          amount,
          type,
          date,
          notes: notes?.trim() || null,
          userId,
          categoryId: categoryId ?? null,
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

      const transaction = await prisma.transaction.findFirst({
        where: { id: input.id, userId },
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

      if (hasCategoryUpdate && input.categoryId) {
        const category = await prisma.category.findFirst({
          where: { id: input.categoryId, userId },
        });

        if (!category) {
          throw new GraphQLError("Category not found.", {
            extensions: { code: "NOT_FOUND" },
          });
        }
      }

      return prisma.transaction.update({
        where: { id: input.id },
        data: {
          title: input.title?.trim(),
          amount: input.amount,
          type: input.type,
          date: input.date,
          notes: Object.prototype.hasOwnProperty.call(input, "notes")
            ? input.notes?.trim() || null
            : undefined,
          categoryId: hasCategoryUpdate ? input.categoryId ?? null : undefined,
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

      const deleted = await prisma.transaction.deleteMany({
        where: { id: args.id, userId },
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
