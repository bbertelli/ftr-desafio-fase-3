import type { GraphQLContext } from "../context";
import { listCategories } from "../../services/categoryService";
import { getUserIdOrThrow } from "../../services/serviceHelpers";
import { listTransactions } from "../../services/transactionService";
import { getAuthenticatedUser } from "../../services/userService";

export const queryResolvers = {
  health: () => "Financy backend is running",
  me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
    const userId = getUserIdOrThrow(context);

    return getAuthenticatedUser(userId);
  },
  categories: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
    const userId = getUserIdOrThrow(context);

    return listCategories(userId);
  },
  transactions: async (
    _parent: unknown,
    _args: unknown,
    context: GraphQLContext,
  ) => {
    const userId = getUserIdOrThrow(context);

    return listTransactions(userId);
  },
};
