import { Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 72;

export function throwBadUserInput(message: string): never {
  throw new GraphQLError(message, {
    extensions: { code: "BAD_USER_INPUT" },
  });
}

export function normalizeRequiredText(
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

export function normalizeOptionalText(
  value?: string | null,
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

export function normalizeAndValidateEmail(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (!EMAIL_REGEX.test(normalized)) {
    throwBadUserInput("Email is invalid.");
  }

  return normalized;
}

export function validatePassword(password: string): string {
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

export function validateAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    throwBadUserInput("Amount must be a number greater than zero.");
  }

  return amount;
}

export function ensureValidDate(value: Date): Date {
  if (Number.isNaN(value.getTime())) {
    throwBadUserInput("Date is invalid.");
  }

  return value;
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}
