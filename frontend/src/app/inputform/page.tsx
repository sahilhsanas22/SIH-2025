"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface FormState {
  name: string;
  roll: string;
  marks: string;
  certId: string;
}

interface OcrResult {
  name?: string;
  marks?: string;
  certificateId?: string;
  error?: string;
  status?: "valid" | "invalid" | "suspicious";
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [darkMode, setDarkMode] = useState(true);
  const [form, setForm] = useState<FormState>({ name: "", roll: "", marks: "", certId: "" });
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [fileObjs, setFileObjs] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ocrResults, setOcrResults] = useState<OcrResult[]>([]);
  const [jobIds, setJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleModeToggle = () => setDarkMode((prev) => !prev);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  const validFiles = files.filter(file => file.type === "application/pdf" || file.type === "image/png");
  setFileUrls(validFiles.map(file => URL.createObjectURL(file)));
  setFileObjs(validFiles);
  };

  const handleOcrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fileObjs.length === 0) return;
    setLoading(true);
    setOcrResults([]);
    setJobIds([]);
    setProgress(0);
    // Enqueue all files at once
    const formData = new FormData();
    fileObjs.forEach(file => formData.append("certificate", file));
    try {
      const res = await fetch("http://localhost:5000/api/ocr/enqueue", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.jobIds) {
        setJobIds(data.jobIds);
        // Poll for each job
        let results: OcrResult[] = Array(data.jobIds.length).fill(null);
        let completed = 0;
  (data.jobIds as string[]).forEach((jobId: string, idx: number) => {
          const poll = setInterval(async () => {
            const statusRes = await fetch(`http://localhost:5000/api/ocr/status/${jobId}`);
            const statusData = await statusRes.json();
            if (statusData.state === "completed" && statusData.result) {
              results[idx] = statusData.result;
              completed++;
              setOcrResults([...results]);
              setProgress(Math.round((completed / data.jobIds.length) * 100));
              clearInterval(poll);
              if (completed === data.jobIds.length) setLoading(false);
            } else if (statusData.state === "failed") {
              results[idx] = { error: "Failed to extract data." };
              completed++;
              setOcrResults([...results]);
              setProgress(Math.round((completed / data.jobIds.length) * 100));
              clearInterval(poll);
              if (completed === data.jobIds.length) setLoading(false);
            }
          }, 2000);
        });
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  return mounted ? (
      <div className={darkMode ? "min-h-screen bg-gray-900 text-white flex flex-col" : "min-h-screen bg-white text-gray-900 flex flex-col"}>
        <header className={darkMode ? "py-6 px-8 flex items-center justify-between border-b border-gray-800" : "py-6 px-8 flex items-center justify-between border-b border-gray-200"}>
          <h1 className="text-3xl font-bold">OCR Certificate Authenticator</h1>
          <div className="flex items-center gap-2">
            <Switch checked={darkMode} onCheckedChange={handleModeToggle} />
            <span className="ml-2">{darkMode ? "🌙" : "🔆"}</span>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center">
          <p className="mb-10 text-center text-lg max-w-2xl">
            This tool checks certificates for authenticity using QR code scanning and OCR.<br />
            You can either fill in the certificate details or upload your certificate PDF/image for validation.
          </p>
          <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
            <section className={darkMode ? "bg-gray-800 rounded-xl p-8 flex-1" : "bg-gray-100 rounded-xl p-8 flex-1"}>
              <h2 className="text-xl font-semibold mb-4">Fill in the fields below for validation.</h2>
              <form className="flex flex-col gap-4">
                <label className="font-semibold">Name
                  <Input name="name" value={form.name} onChange={handleChange} className={darkMode ? "bg-gray-900 text-white" : "bg-white text-black border-gray-300"} />
                </label>
                <label className="font-semibold">Roll No
                  <Input name="roll" value={form.roll} onChange={handleChange} className={darkMode ? "bg-gray-900 text-white" : "bg-white text-black border-gray-300"} />
                </label>
                <label className="font-semibold">Marks
                  <Input name="marks" value={form.marks} onChange={handleChange} className={darkMode ? "bg-gray-900 text-white" : "bg-white text-black border-gray-300"} />
                </label>
                <label className="font-semibold">Certificate ID
                  <Input name="certId" value={form.certId} onChange={handleChange} className={darkMode ? "bg-gray-900 text-white" : "bg-white text-black border-gray-300"} />
                </label>
                <Button type="submit" className="mt-4">Submit</Button>
              </form>
            </section>
            <section className={darkMode ? "bg-gray-800 rounded-xl p-8 flex-1" : "bg-gray-100 rounded-xl p-8 flex-1"}>
              <h2 className="text-xl font-semibold mb-4">Upload certificate files for batch validation.</h2>
              <form className="flex flex-col gap-4" onSubmit={handleOcrSubmit}>
                <label className="font-semibold">Upload Certificates
                  <Input ref={fileInputRef} type="file" accept="application/pdf,image/png" multiple onChange={handleFileChange} className={darkMode ? "bg-gray-900 text-white" : "bg-white text-black border-gray-300"} />
                </label>
                <Button type="submit" className="mt-4" disabled={fileObjs.length === 0 || loading}>{loading ? "Extracting..." : "Submit"}</Button>
              </form>
              {loading && (
                <div className="mt-4 w-full">
                  <div className="w-full bg-gray-300 rounded-full h-4 dark:bg-gray-700">
                    <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="text-center mt-2">{progress}% extracted</div>
                </div>
              )}
            </section>
          </div>
          {mounted && fileUrls.length > 0 && (
            <div className="mt-8 w-full max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-2">File Previews:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fileObjs.map((file, idx) => (
                  <div key={idx} className="mb-4">
                    {file.type === "application/pdf" ? (
                      <iframe
                        src={fileUrls[idx]}
                        title={`PDF Preview ${idx+1}`}
                        width="100%"
                        height="300px"
                        className={darkMode ? "bg-gray-900 border border-gray-700 rounded" : "bg-white border border-gray-300 rounded"}
                      />
                    ) : (
                      <img
                        src={fileUrls[idx]}
                        alt={`Image Preview ${idx+1}`}
                        style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "0.5rem", border: darkMode ? "1px solid #374151" : "1px solid #d1d5db" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {mounted && ocrResults.length > 0 && (
            <div className={darkMode ? "mt-8 w-full max-w-2xl mx-auto bg-gray-800 rounded-xl p-6 shadow-lg" : "mt-8 w-full max-w-2xl mx-auto bg-gray-100 rounded-xl p-6 shadow-lg"}>
              <h3 className="text-xl font-bold mb-4 text-center">Extracted Certificate Data</h3>
              {ocrResults.map((ocrResult, idx) => (
                <div key={idx} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Document {idx + 1}</span>
                    {!ocrResult && <span className="text-gray-400 text-2xl">⏳</span>}
                    {ocrResult && ocrResult.status === "valid" && <span className="text-green-500 text-2xl">✅</span>}
                    {ocrResult && ocrResult.status === "invalid" && <span className="text-red-500 text-2xl">❌</span>}
                    {ocrResult && ocrResult.status === "suspicious" && <span className="text-yellow-500 text-2xl">⚠️</span>}
                  </div>
                  {!ocrResult ? (
                    <div className="text-gray-500 text-center">Processing...</div>
                  ) : ocrResult.error ? (
                    <div className="text-red-500 text-center">{ocrResult.error}</div>
                  ) : (
                    <div>
                      <div><strong>Name:</strong> {ocrResult.name || "-"}</div>
                      <div><strong>Marks:</strong> {ocrResult.marks || "-"}</div>
                      <div><strong>Certificate ID:</strong> {ocrResult.certificateId || "-"}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
        <div className="fixed left-4 bottom-4">
          <div className="bg-red-600 text-white rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
            <span className="font-bold">N</span>
            <span>1 Issue</span>
          </div>
        </div>
      </div>
  ) : null;
}
