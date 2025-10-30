import express from "express";
import cors from "cors";
import formidable from "formidable";
import fs from "fs";
import { put, del } from "@vercel/blob";

const app = express();

// ✅ CORS — acepta CodeSandbox, localhost y dominio oficial
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://nkjconstructionllc.com",
      /\.csb\.app$/, // ✅ CodeSandbox
    ],
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ✅ Subida múltiple con verificación de peso
app.post("/api/upload", (req, res) => {
  const form = formidable({ multiples: true, keepExtensions: true });

  form.parse(req, async (err, _fields, files) => {
    if (err) {
      console.error("❌ Error al procesar archivos:", err);
      return res.status(500).json({ error: "Error al procesar archivos" });
    }

    try {
      // ✅ Captura todos los archivos, sin importar el nombre (file_0, file_1, etc.)
      const fileArray = Object.values(files).flat();
      if (!fileArray.length)
        return res.status(400).json({ error: "No se enviaron archivos" });

      const urls = [];
      const MAX_MB = 4;

      for (const file of fileArray) {
        if (file.size > MAX_MB * 1024 * 1024) {
          console.warn(`⚠️ ${file.originalFilename} excede ${MAX_MB}MB`);
          continue;
        }

        const stream = fs.createReadStream(file.filepath);
        const blob = await put(file.originalFilename, stream, {
          access: "public",
        });
        urls.push(blob.url);
      }

      console.log("✅ Imágenes subidas:", urls);
      res.status(200).json({ success: true, urls });
    } catch (error) {
      console.error("❌ Error al subir imágenes:", error);
      res.status(500).json({ error: "Error al subir imágenes" });
    }
  });
});

// 🗑️ Eliminar imagen
app.delete("/api/delete", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Falta la URL" });
    await del(url);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error al eliminar archivo:", error);
    res.status(500).json({ error: "Error al eliminar archivo" });
  }
});

app.get("/", (_req, res) => res.json({ message: "✅ Backend operativo" }));

app.listen(3000, () => console.log("Servidor corriendo en puerto 3000"));
// import express from "express";
// import cors from "cors";
// import formidable from "formidable";
// import fs from "fs";
// import { put, del } from "@vercel/blob";

// const app = express();

// // ✅ CORS — acepta CodeSandbox, localhost y dominio oficial
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "https://nkjconstructionllc.com",
//       /\.csb\.app$/, // ✅ para CodeSandbox
//     ],
//     methods: ["GET", "POST", "DELETE"],
//     allowedHeaders: ["Content-Type"],
//   })
// );

// app.use(express.json());

// // ✅ Subida de múltiples imágenes por petición
// app.post("/api/upload", (req, res) => {
//   const form = formidable({ multiples: true, keepExtensions: true });

//   form.parse(req, async (err, _fields, files) => {
//     if (err) {
//       console.error("❌ Error al procesar archivo:", err);
//       return res.status(500).json({ error: "Error al procesar archivo" });
//     }

//     try {
//       const fileArray = Array.isArray(files.file)
//         ? files.file
//         : [files.file].filter(Boolean);

//       if (!fileArray.length)
//         return res.status(400).json({ error: "No se envió archivo" });

//       const urls = [];
//       const MAX_MB = 4;

//       for (const file of fileArray) {
//         if (file.size > MAX_MB * 1024 * 1024) {
//           console.warn(`⚠️ Archivo demasiado grande: ${file.originalFilename}`);
//           continue; // ignora ese archivo
//         }

//         const stream = fs.createReadStream(file.filepath);
//         const blob = await put(file.originalFilename, stream, {
//           access: "public",
//         });
//         urls.push(blob.url);
//       }

//       console.log("✅ Imágenes subidas:", urls);
//       res.status(200).json({ success: true, urls });
//     } catch (error) {
//       console.error("❌ Error al subir imágenes:", error);
//       res.status(500).json({ error: "Error al subir imágenes" });
//     }
//   });
// });

// // 🗑️ Eliminar imagen del blob
// app.delete("/api/delete", async (req, res) => {
//   try {
//     const { url } = req.body;
//     if (!url) return res.status(400).json({ error: "Falta la URL" });
//     await del(url);
//     res.json({ success: true });
//   } catch (error) {
//     console.error("❌ Error al eliminar archivo:", error);
//     res.status(500).json({ error: "Error al eliminar archivo" });
//   }
// });

// // 🔍 Prueba rápida
// app.get("/", (_req, res) => res.json({ message: "✅ Backend operativo" }));

// app.listen(3000, () => console.log("Servidor corriendo en puerto 3000"));
