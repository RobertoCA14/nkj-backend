import express from "express";
import cors from "cors";
import formidable from "formidable";
import fs from "fs";
import { put, del } from "@vercel/blob";

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "🚀 Backend corriendo correctamente" });
});

// ✅ Subida de imágenes
app.post("/api/upload", async (req, res) => {
  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Error al procesar archivo:", err);
      return res.status(500).json({ error: "Error al procesar archivo" });
    }

    const file = files.file?.[0];
    if (!file) return res.status(400).json({ error: "No se envió archivo" });

    try {
      // ✅ Lee el archivo como stream
      const stream = fs.createReadStream(file.filepath);

      // ✅ Lo sube a Vercel Blob
      const blob = await put(file.originalFilename, stream, {
        access: "public",
      });

      console.log("✅ Archivo subido a:", blob.url);
      res.json({ success: true, url: blob.url });
    } catch (error) {
      console.error("❌ Error al subir archivo:", error);
      res.status(500).json({ error: "Error al subir archivo" });
    }
  });
});
// 🔹 Eliminación de imágenes de Vercel Blob
app.delete("/api/delete", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url)
      return res.status(400).json({ error: "Falta la URL del archivo" });

    await del(url); // 🧹 Elimina el archivo remoto
    console.log("🗑️ Archivo eliminado de Blob:", url);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al eliminar archivo:", error);
    res.status(500).json({ error: "Error al eliminar archivo" });
  }
});
app.listen(3000, () => console.log("✅ Servidor corriendo en puerto 3000"));
