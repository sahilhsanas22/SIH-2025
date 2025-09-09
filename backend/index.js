import express from "express";
import { Queue, Worker, QueueEvents } from "bullmq";
import { v4 as uuidv4 } from "uuid";
import Redis from "ioredis";
import { getCertificateStatus, validateAuthenticatorLogin, validateAdminLogin } from "./db.js";
import cors from "cors";
import multer from "multer";
import { fromPath } from "pdf2pic";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";

const app = express();
const redis = new Redis({ maxRetriesPerRequest: null });
const ocrQueue = new Queue("ocrQueue", { connection: redis });
const ocrQueueEvents = new QueueEvents("ocrQueue", { connection: redis });
const ocrResults = {};
app.use(cors());
const upload = multer({ dest: "uploads/" });
const PORT = 5000;

app.use(express.json());

// Endpoint to enqueue documents for OCR
app.post("/api/ocr/enqueue", upload.array("certificate", 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }
  const jobIds = [];
  for (const file of req.files) {
    const jobId = uuidv4();
    await ocrQueue.add("ocr", { filePath: file.path }, { jobId });
    jobIds.push(jobId);
  }
  res.json({ jobIds });
});

// Endpoint to get status/results of jobs
app.get("/api/ocr/status/:jobId", async (req, res) => {
  const jobId = req.params.jobId;
  const job = await ocrQueue.getJob(jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  const state = await job.getState();
  const result = ocrResults[jobId] || null;
  res.json({ state, result });
});

// Worker to process OCR jobs
const ocrWorker = new Worker("ocrQueue", async job => {
  try {
    const filePath = job.data.filePath;
    const outputDir = path.join("uploads", `pdf_${Date.now()}_${Math.random().toString(36).slice(2,8)}`);
    fs.mkdirSync(outputDir);
    const options = {
      density: 200,
      saveFilename: "page",
      savePath: outputDir,
      format: "png",
      width: 1200,
      height: 1600
    };
    const storeAsImage = fromPath(filePath, options);
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
    const status = await getCertificateStatus({
      name: result.name,
      marks: result.marks,
      certificateId: result.certificateId
    });
    result.status = status;
    ocrResults[job.id] = result;
    fs.unlinkSync(filePath);
    fs.unlinkSync(imagePath);
    fs.rmdirSync(outputDir);
    console.log(`[OCR Worker] Job ${job.id} completed.`);
    return result;
  } catch (err) {
    ocrResults[job.id] = { error: err.message };
    console.error(`[OCR Worker] Job ${job.id} failed:`, err);
    // Attempt to clean up temp files if possible
    try {
      if (job.data.filePath) fs.unlinkSync(job.data.filePath);
    } catch {}
    return { error: err.message };
  }
}, { connection: redis });

app.post("/api/ocr", upload.array("certificate", 10), async (req, res) => {
  // Deprecated: use /api/ocr/enqueue for queue-based processing
  res.status(410).json({ error: "Use /api/ocr/enqueue for batch processing" });
});

app.post("/api/authenticator-login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const valid = await validateAuthenticatorLogin({ username, password });
    if (valid) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin-login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const valid = await validateAdminLogin({ username, password });
    if (valid) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`OCR backend running on port ${PORT}`);
});
