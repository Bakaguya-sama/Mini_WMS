import app from "@/app";
import dotenv from "dotenv";
import { createServer } from "http";
import { env } from "./config/env.config";

dotenv.config();

const PORT = env.PORT;

const httpServer = createServer(app);

const shutdown = (signal: string) => {
  console.log(`🛑 Received ${signal}. Shutting down...`);
  httpServer.close(async () => {
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 5000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running smoothly on port ${PORT}`);
  console.log(`👉 Check health at: http://localhost:${PORT}/api/health`);
});
