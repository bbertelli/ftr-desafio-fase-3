import { GraphQLScalarType, Kind } from "graphql";

export const DateTimeScalar = new GraphQLScalarType({
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
