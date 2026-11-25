import { Router } from "express";
import multer from "multer";
import { importarPedidosCsv, listarPedidos } from "../controllers/pedidos.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isCsv =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.toLowerCase().endsWith(".csv");

    if (!isCsv) {
      return cb(new Error("Solo se permiten archivos con extensión .csv"));
    }
    cb(null, true);
  },
});

router.get("/pedidos", listarPedidos);
router.post("/pedidos/importar-csv", upload.single("archivo"), importarPedidosCsv);

export default router;