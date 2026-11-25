import { Router } from "express";
import { optimizarRutaController } from "../controllers/rutas.controller.js";

const router = Router();

router.post("/rutas/optimizar", optimizarRutaController);

export default router;