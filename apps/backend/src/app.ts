import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config";
import authRoute from "@/modules/auth/auth.routes";
import usersRoute from "@/modules/user/user.routes";
import warehousesRoute from "@/modules/warehouse/warehouse.routes";
import packagesRoute from "@/modules/package/package.routes";
import dashboardRoute from "@/modules/dashboard/dashboard.routes";
import { AppError } from "./shared/errors/AppError";
import { env } from "./config/env.config";

const app = express();

app.get(
  "/api-docs",
  helmet({ contentSecurityPolicy: false }),
  (req, res) => {
    res.type("html").send(`
<!DOCTYPE html>
<html>
<head>
  <title>Mini WMS API Docs</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css" />
  <style>body { margin: 0; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: "/api-docs.json",
        dom_id: "#swagger-ui",
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "StandaloneLayout",
      });
    };
  </script>
</body>
</html>
  `);
  }
);

app.get("/api-docs.json", (req, res) => {
  res.json(swaggerSpec);
});

app.use(helmet());
const allowedOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // If wildcard '*' is in allowedOrigins, dynamically reflect the requesting origin
    // This is required because 'Access-Control-Allow-Origin: *' is forbidden when credentials: true
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, origin);
    }

    // Otherwise, block the request
    return callback(null, false);
  },
  credentials: true
}));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());



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
