import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";

import { prisma } from "../lib/prisma";
import {
  isUniqueConstraintError,
  normalizeAndValidateEmail,
  normalizeRequiredText,
  throwBadUserInput,
  validatePassword,
} from "../utils/validation";

export async function getAuthenticatedUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new GraphQLError("Authenticated user was not found.");
  }

  return user;
}

type UpdateProfileInput = {
  name?: string | null;
  email?: string | null;
  password?: string | null;
};

export async function updateAuthenticatedUser(
  input: UpdateProfileInput,
  userId: string,
) {
  const hasNameUpdate = Object.prototype.hasOwnProperty.call(input, "name");
  const hasEmailUpdate = Object.prototype.hasOwnProperty.call(input, "email");
  const hasPasswordUpdate = Object.prototype.hasOwnProperty.call(input, "password");

  if (!hasNameUpdate && !hasEmailUpdate && !hasPasswordUpdate) {
    throwBadUserInput("At least one field must be provided to update.");
  }

  if (hasNameUpdate && input.name === null) {
    throwBadUserInput("Name cannot be null.");
  }

  if (hasEmailUpdate && input.email === null) {
    throwBadUserInput("Email cannot be null.");
  }

  if (hasPasswordUpdate && input.password === null) {
    throwBadUserInput("Password cannot be null.");
  }

  const nameInput = input.name;
  const emailInput = input.email;
  const passwordInput = input.password;

  if (hasNameUpdate && typeof nameInput !== "string") {
    throwBadUserInput("Name is invalid.");
  }

  if (hasEmailUpdate && typeof emailInput !== "string") {
    throwBadUserInput("Email is invalid.");
  }

  if (hasPasswordUpdate && typeof passwordInput !== "string") {
    throwBadUserInput("Password is invalid.");
  }

  const normalizedName =
    hasNameUpdate
      ? normalizeRequiredText(nameInput as string, "Name", {
          minLength: 2,
          maxLength: 80,
        })
      : undefined;

  const normalizedEmail =
    hasEmailUpdate
      ? normalizeAndValidateEmail(emailInput as string)
      : undefined;

  const hashedPassword =
    hasPasswordUpdate
      ? await bcrypt.hash(validatePassword(passwordInput as string), 10)
      : undefined;

  try {
    return prisma.user.update({
      where: { id: userId },
      data: {
        name: hasNameUpdate ? normalizedName : undefined,
        email: hasEmailUpdate ? normalizedEmail : undefined,
        passwordHash: hasPasswordUpdate ? hashedPassword : undefined,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new GraphQLError("Email is already in use.", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    throw error;
  }
}
