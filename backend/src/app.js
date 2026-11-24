import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/health", healthRouter);

export default app;