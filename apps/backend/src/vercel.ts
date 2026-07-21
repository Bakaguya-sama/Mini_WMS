import moduleAlias from "module-alias";
moduleAlias.addAliases({ "@": __dirname });
import app from "./app";

export default app;
