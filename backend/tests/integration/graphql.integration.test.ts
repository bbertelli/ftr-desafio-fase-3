import "dotenv/config";

import { execSync } from "node:child_process";

import type { ApolloServer } from "@apollo/server";
import type { Express } from "express";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../src/app";
import { prisma } from "../../src/lib/prisma";

const POST_GRAPHQL = "/graphql";

describe("GraphQL integration", () => {
  let app: Express;
  let apolloServer: ApolloServer;

  beforeAll(async () => {
    execSync("npx prisma db push", {
      cwd: process.cwd(),
      env: process.env,
      stdio: "ignore",
    });

    const setup = await createApp();
    app = setup.app;
    apolloServer = setup.apolloServer;
  });

  beforeEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    if (apolloServer) {
      await apolloServer.stop();
    }
    await prisma.$disconnect();
  });

  it("creates account and logs in", async () => {
    const signupResponse = await request(app).post(POST_GRAPHQL).send({
      query: `
        mutation Signup($input: SignupInput!) {
          signup(input: $input) {
            token
            user {
              id
              email
            }
          }
        }
      `,
      variables: {
        input: {
          name: "Alice",
          email: "alice@example.com",
          password: "123456",
        },
      },
    });

    expect(signupResponse.status).toBe(200);
    expect(signupResponse.body.errors).toBeUndefined();
    expect(signupResponse.body.data.signup.token).toBeTypeOf("string");
    expect(signupResponse.body.data.signup.user.email).toBe("alice@example.com");

    const loginResponse = await request(app).post(POST_GRAPHQL).send({
      query: `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user {
              id
              email
            }
          }
        }
      `,
      variables: {
        input: {
          email: "alice@example.com",
          password: "123456",
        },
      },
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.errors).toBeUndefined();
    expect(loginResponse.body.data.login.token).toBeTypeOf("string");
    expect(loginResponse.body.data.login.user.email).toBe("alice@example.com");
  });

  it("requires authentication for protected queries", async () => {
    const response = await request(app).post(POST_GRAPHQL).send({
      query: `
        query {
          categories {
            id
          }
        }
      `,
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeNull();
    expect(response.body.errors[0].extensions.code).toBe("UNAUTHENTICATED");
  });

  it("isolates data by user when listing categories and transactions", async () => {
    const tokenA = await signupAndGetToken(app, {
      name: "Alice",
      email: "alice@example.com",
      password: "123456",
    });

    const tokenB = await signupAndGetToken(app, {
      name: "Bob",
      email: "bob@example.com",
      password: "123456",
    });

    const categoryAId = await createCategory(app, tokenA, "Food");
    await createCategory(app, tokenB, "Travel");

    await createTransaction(app, tokenA, {
      title: "Lunch",
      amount: 20.5,
      type: "EXPENSE",
      date: "2026-02-28T12:00:00.000Z",
      categoryId: categoryAId,
    });

    await createTransaction(app, tokenB, {
      title: "Salary",
      amount: 5000,
      type: "INCOME",
      date: "2026-02-28T08:00:00.000Z",
      categoryId: null,
    });

    const userAResponse = await request(app)
      .post(POST_GRAPHQL)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        query: `
          query {
            categories {
              name
            }
            transactions {
              title
              amount
            }
          }
        `,
      });

    expect(userAResponse.status).toBe(200);
    expect(userAResponse.body.errors).toBeUndefined();
    expect(userAResponse.body.data.categories).toEqual([{ name: "Food" }]);
    expect(userAResponse.body.data.transactions).toEqual([
      { title: "Lunch", amount: 20.5 },
    ]);
  });
});

async function signupAndGetToken(
  app: Express,
  input: { name: string; email: string; password: string },
): Promise<string> {
  const response = await request(app).post(POST_GRAPHQL).send({
    query: `
      mutation Signup($input: SignupInput!) {
        signup(input: $input) {
          token
        }
      }
    `,
    variables: { input },
  });

  expect(response.status).toBe(200);
  expect(response.body.errors).toBeUndefined();

  return response.body.data.signup.token;
}

async function createCategory(
  app: Express,
  token: string,
  name: string,
): Promise<string> {
  const response = await request(app)
    .post(POST_GRAPHQL)
    .set("Authorization", `Bearer ${token}`)
    .send({
      query: `
        mutation CreateCategory($input: CreateCategoryInput!) {
          createCategory(input: $input) {
            id
          }
        }
      `,
      variables: { input: { name } },
    });

  expect(response.status).toBe(200);
  expect(response.body.errors).toBeUndefined();

  return response.body.data.createCategory.id;
}

async function createTransaction(
  app: Express,
  token: string,
  input: {
    title: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    date: string;
    categoryId: string | null;
  },
) {
  const response = await request(app)
    .post(POST_GRAPHQL)
    .set("Authorization", `Bearer ${token}`)
    .send({
      query: `
        mutation CreateTransaction($input: CreateTransactionInput!) {
          createTransaction(input: $input) {
            id
          }
        }
      `,
      variables: { input },
    });

  expect(response.status).toBe(200);
  expect(response.body.errors).toBeUndefined();
}
