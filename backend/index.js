import express from "express";
import cors from "cors";
import multer from "multer";
import { fromPath } from "pdf2pic";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });
const PORT = 5000;

app.use(express.json());

app.post("/api/ocr", upload.single("certificate"), async (req, res) => {
  try {
    const pdfPath = req.file.path;
    const outputDir = path.join("uploads", `pdf_${Date.now()}`);
    fs.mkdirSync(outputDir);

    const options = {
      density: 200,
      saveFilename: "page",
      savePath: outputDir,
      format: "png",
      width: 1200,
      height: 1600
    };
    const storeAsImage = fromPath(pdfPath, options);
    const imageResult = await storeAsImage(1);
    const imagePath = imageResult.path;

  const { data: { text } } = await Tesseract.recognize(imagePath, "eng");
  const cleanedText = text.replace(/\u00A0/g, ' ').replace(/[^\S\r\n]+/g, ' ').trim();
  const nameRe = /(?:Student\s*Name|Name)\s*[:\-]?\s*([\p{L}\d\s.'-]+?)(?=\s*(?:Mother(?:'s)?\s*Name|Mother\b|Marks|Certificate|Seat\s*No|College|$))/iu;
  const nameMatch = cleanedText.match(nameRe);
    const marksMatch = text.match(/Third Semester SGPA\s*[:\-]?\s*([\d\.]+)/i);
    const certIdMatch = text.match(/Perm Reg No\(PRN\)\s*[:\-]?\s*([A-Z0-9]+)/i);

    const result = {
      name: nameMatch ? nameMatch[1].trim() : null,
      marks: marksMatch ? marksMatch[1].trim() : null,
      certificateId: certIdMatch ? certIdMatch[1].trim() : null,
      rawText: text
    };

    console.log("OCR Extraction Result:", result);

  fs.unlinkSync(pdfPath);
  fs.unlinkSync(imagePath);
  fs.rmdirSync(outputDir);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`OCR backend running on port ${PORT}`);
});
