import express from "express";
import cors from "cors";
import formidable from "formidable";
import fs from "fs";
import { put, del } from "@vercel/blob";

const app = express();

// ✅ CORS
app.use(
  cors({
    origin: [
      "https://nkjconstructionllc.com",
      "http://localhost:5173",
      "https://j6ltjs-5173.csb.app",
      "https://76njlz-5173.csb.app",
    ],
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// 🚀 Test
app.get("/", (req, res) => res.json({ message: "✅ Backend funcionando" }));

// ✅ MULTIPLE IMAGE UPLOAD
app.post("/api/upload", (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Error procesando archivo" });

    try {
      const uploadedUrls = [];

      // Asegurar que `files.file` sea un array
      const fileList = Array.isArray(files.file) ? files.file : [files.file];

      for (const file of fileList) {
        const buffer = await fs.promises.readFile(file.filepath);
        const blob = await put(file.originalFilename, buffer, {
          access: "public",
        });
        uploadedUrls.push(blob.url);
      }

      console.log("✅ Imágenes subidas:", uploadedUrls.length);
      return res.status(200).json({ success: true, urls: uploadedUrls });
    } catch (error) {
      console.error("❌ Error al subir imágenes:", error);
      return res.status(500).json({ error: "Error al subir imágenes" });
    }
  });
});

// 🗑️ DELETE IMAGE
app.delete("/api/delete", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Falta la URL" });

    await del(url);
    console.log("🗑️ Imagen eliminada:", url);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al eliminar imagen:", error);
    res.status(500).json({ error: "Error al eliminar imagen" });
  }
});

app.listen(3000, () => console.log("✅ Servidor en puerto 3000"));
