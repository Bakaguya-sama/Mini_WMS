import app from "@/app";
import dotenv from "dotenv";
import { createServer } from "http";
import { env } from "./config/env.config";

dotenv.config();

const PORT = env.PORT;

const httpServer = createServer(app);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running smoothly on port ${PORT}`);
  console.log(`👉 Check health at: http://localhost:${PORT}/api/health`);
});
