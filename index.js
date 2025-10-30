// server.js  (o index.js)
import express from "express";
import cors from "cors";
import formidable from "formidable";
import fs from "fs";
import { put, del } from "@vercel/blob";

const app = express();

app.use(
  cors({
    origin: [
      "https://nkjconstructionllc.com",
      "http://localhost:5173",
      "https://j6ltjs-5173.csb.app",
      "https://76njlz-5173.csb.app",
      "https://76njlz-5173.csb.app",
    ],
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

app.get("/", (_req, res) => res.json({ message: "✅ Backend funcionando" }));

// ✅ SUBIR UNA IMAGEN POR PETICIÓN (compatible con tu base)
app.post("/api/upload", (req, res) => {
  // multiples:false = UNA imagen por request (así funcionaba tu base)
  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, _fields, files) => {
    if (err) {
      console.error("❌ Error al procesar archivo:", err);
      return res.status(500).json({ error: "Error al procesar archivo" });
    }
    try {
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) return res.status(400).json({ error: "No se envió archivo" });

      const buffer = await fs.promises.readFile(file.filepath);
      const blob = await put(file.originalFilename, buffer, {
        access: "public",
      });

      // 👇 contrato idéntico al que ya usabas en el frontend base
      return res.status(200).json({ success: true, url: blob.url });
    } catch (error) {
      console.error("❌ Error al subir a Blob:", error);
      return res.status(500).json({ error: "Error al subir imagen" });
    }
  });
});

// 🗑️ ELIMINAR UNA IMAGEN
app.delete("/api/delete", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url)
      return res.status(400).json({ error: "Falta la URL del archivo" });

    await del(url);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al eliminar archivo:", error);
    res.status(500).json({ error: "Error al eliminar archivo" });
  }
});

// Puerto local (ignorado en Vercel)
app.listen(3000, () => console.log("✅ Servidor corriendo en puerto 3000"));
