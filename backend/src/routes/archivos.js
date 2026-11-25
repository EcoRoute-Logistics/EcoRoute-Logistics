import { Router } from "express";
import multer from "multer";
import { subirArchivo, urlTemporal } from "../s3.js";

const CARPETAS = { foto: "fotos", firma: "firmas" };
const PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, PERMITIDOS.includes(file.mimetype)),
});

const router = Router();

router.post("/", upload.single("archivo"), async (req, res) => {
  const carpeta = CARPETAS[req.body?.tipo];
  if (!carpeta) {
    return res.status(400).json({ error: "tipo debe ser 'foto' o 'firma'" });
  }
  if (!req.file) {
    return res.status(400).json({ error: "Falta el archivo (imagen JPG, PNG o WEBP de máximo 5 MB)" });
  }
  try {
    const clave = await subirArchivo({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      nombreOriginal: req.file.originalname,
      carpeta,
    });
    res.status(201).json({ clave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo guardar el archivo" });
  }
});

router.get("/url", async (req, res) => {
  const { clave } = req.query;
  if (typeof clave !== "string" || !/^(fotos|firmas)\/[\w-]+\.\w+$/.test(clave)) {
    return res.status(400).json({ error: "clave inválida" });
  }
  try {
    res.json({ url: await urlTemporal(clave) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo generar el enlace" });
  }
});

export default router;