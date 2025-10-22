import express from "express";
import cors from "cors";
import formidable from "formidable";
import fs from "fs";
import { put, del } from "@vercel/blob";

const app = express();

// ✅ CORS — incluye tu dominio de producción y sandbox si estás probando
app.use(
  cors({
    origin: [
      "https://nkjconstructionllc.com",
      "http://localhost:5173",
      "https://j6ltjs-5173.csb.app",
    ],
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// 🚀 Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "✅ Backend funcionando" });
});

// ✅ SUBIDA DE IMÁGENES
app.post("/api/upload", (req, res) => {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Error al procesar archivo:", err);
      return res.status(500).json({ error: "Error al procesar archivo" });
    }

    try {
      // ✅ Manejo robusto de archivo
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) {
        console.error("⚠️ No se recibió archivo");
        return res.status(400).json({ error: "No se envió archivo" });
      }

      // ✅ Leer archivo y subir a Blob
      const buffer = await fs.promises.readFile(file.filepath);
      const blob = await put(file.originalFilename, buffer, {
        access: "public",
      });

      console.log("✅ Archivo subido a:", blob.url);
      return res.status(200).json({ success: true, url: blob.url });
    } catch (error) {
      console.error("❌ Error al subir a Blob:", error);
      return res.status(500).json({ error: "Error al subir imagen" });
    }
  });
});

// 🗑️ ELIMINAR IMÁGENES
app.delete("/api/delete", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url)
      return res.status(400).json({ error: "Falta la URL del archivo" });

    await del(url);
    console.log("🗑️ Archivo eliminado:", url);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al eliminar archivo:", error);
    res.status(500).json({ error: "Error al eliminar archivo" });
  }
});

// 🟢 Puerto local (ignorado en Vercel)
app.listen(3000, () => console.log("✅ Servidor corriendo en puerto 3000"));
