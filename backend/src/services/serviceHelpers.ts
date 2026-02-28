import { GraphQLError } from "graphql";

import type { GraphQLContext } from "../graphql/context";

export function getUserIdOrThrow(context: GraphQLContext): string {
  if (!context.userId) {
    throw new GraphQLError("Authentication required.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  return context.userId;
}
