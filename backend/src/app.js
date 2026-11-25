import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import archivosRouter from "./routes/archivos.js";
import authRouter from "./routes/auth.js";
import vehiculosRouter from "./routes/vehiculos.js";
import conductoresRouter from "./routes/conductores.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/vehiculos", vehiculosRouter);
app.use("/api/conductores", conductoresRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/health", healthRouter);
app.use("/api/archivos", archivosRouter);
app.use("/api/auth", authRouter);
export default app;