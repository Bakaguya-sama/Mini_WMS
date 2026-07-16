import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config";
import authRoute from "@/modules/auth/auth.routes";
import usersRoute from "@/modules/user/user.routes";
import warehousesRoute from "@/modules/warehouse/warehouse.routes";
import packagesRoute from "@/modules/package/package.routes";
import dashboardRoute from "@/modules/dashboard/dashboard.routes";
import { AppError } from "./shared/errors/AppError";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use(
  "/api-docs",
  helmet({ contentSecurityPolicy: false }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec),
);

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", usersRoute);
app.use("/api/v1/warehouses", warehousesRoute);
app.use("/api/v1/packages", packagesRoute);
app.use("/api/v1/dashboard", dashboardRoute);

app.use((req, res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.path} not found`));
});
app.use(errorHandler);

export default app;
