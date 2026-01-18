import express from "express";
import callRoutes from "./routes/call.routes.js";

const app = express();
app.use(express.json());
app.use("/api/call", callRoutes);

export default app;
