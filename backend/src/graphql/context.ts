import type { Request } from "express";
import { GraphQLError } from "graphql";

import { verifyToken } from "../auth";

export type GraphQLContext = {
  userId: string | null;
};

export async function buildContext({
  req,
}: {
  req: Request;
}): Promise<GraphQLContext> {
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
}
