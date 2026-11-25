import { Router } from "express";
import {
  optimizarRutaController,
  crearRutaController,
  listarRutasController,
  obtenerRutaController,
} from "../controllers/rutas.controller.js";

const router = Router();

router.get("/rutas", listarRutasController);
router.get("/rutas/:id", obtenerRutaController);
router.post("/rutas", crearRutaController);
router.post("/rutas/optimizar", optimizarRutaController);

export default router;