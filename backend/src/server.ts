import "dotenv/config";

import { createApp } from "./app";

async function bootstrap() {
  const { app } = await createApp();
  const port = Number(process.env.PORT ?? 4000);

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/graphql`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
