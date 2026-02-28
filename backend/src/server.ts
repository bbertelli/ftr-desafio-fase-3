import "dotenv/config";

import cors from "cors";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildContext } from "./graphql/context";
import { resolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/typeDefs";

async function bootstrap() {
  const app = express();
  const port = Number(process.env.PORT ?? 4000);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(cors());
  app.use(express.json());
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: buildContext,
    }),
  );

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/graphql`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
