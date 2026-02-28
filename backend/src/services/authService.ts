import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";

import { generateToken } from "../auth";
import { prisma } from "../lib/prisma";
import {
  normalizeAndValidateEmail,
  normalizeRequiredText,
  validatePassword,
} from "../utils/validation";

export async function signup(input: {
  name: string;
  email: string;
  password: string;
}) {
  const normalizedName = normalizeRequiredText(input.name, "Name", {
    minLength: 2,
    maxLength: 80,
  });
  const normalizedEmail = normalizeAndValidateEmail(input.email);
  const validatedPassword = validatePassword(input.password);

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
}

export async function login(input: { email: string; password: string }) {
  const normalizedEmail = normalizeAndValidateEmail(input.email);
  const validatedPassword = normalizeRequiredText(input.password, "Password", {
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
}
