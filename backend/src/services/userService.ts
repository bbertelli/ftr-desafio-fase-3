import { GraphQLError } from "graphql";

import { prisma } from "../lib/prisma";

export async function getAuthenticatedUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new GraphQLError("Authenticated user was not found.");
  }

  return user;
}
