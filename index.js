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

// ✅ SUBIDA DE MÚLTIPLES IMÁGENES
app.post("/api/upload", (req, res) => {
  const form = formidable({ multiples: true }); // ← permite varios archivos

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Error al procesar archivos:", err);
      return res.status(500).json({ error: "Error al procesar archivos" });
    }

    try {
      // 🔹 Asegurar que 'files.file' siempre sea un array
      const fileList = Array.isArray(files.file) ? files.file : [files.file];
      const urls = [];

      // 🔹 Subir cada archivo a Vercel Blob
      for (const file of fileList) {
        const buffer = await fs.promises.readFile(file.filepath);
        const blob = await put(file.originalFilename, buffer, {
          access: "public",
        });
        urls.push(blob.url);
        console.log("✅ Subido:", blob.url);
      }

      // 🔹 Devuelve todas las URLs al frontend
      res.status(200).json({ success: true, urls });
    } catch (error) {
      console.error("❌ Error al subir imágenes:", error);
      res.status(500).json({ error: "Error al subir imágenes" });
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
