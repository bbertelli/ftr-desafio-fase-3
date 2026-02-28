import { mutationResolvers } from "./mutationResolvers";
import { queryResolvers } from "./queryResolvers";
import { DateTimeScalar } from "../scalars/dateTime";

export const resolvers = {
  DateTime: DateTimeScalar,
  Query: queryResolvers,
  Mutation: mutationResolvers,
};
