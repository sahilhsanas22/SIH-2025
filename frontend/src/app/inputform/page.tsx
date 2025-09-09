"use client";
import React, { useState, useRef } from "react";
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
  const [darkMode, setDarkMode] = useState(true);
  const [form, setForm] = useState<FormState>({ name: "", roll: "", marks: "", certId: "" });
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileObj, setFileObj] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleModeToggle = () => setDarkMode((prev) => !prev);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "application/pdf" || file.type === "image/png")) {
      setFileUrl(URL.createObjectURL(file));
      setFileObj(file);
    } else {
      setFileUrl(null);
      setFileObj(null);
    }
  };

  const handleOcrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileObj) return;
    setLoading(true);
    setOcrResult(null);
    const formData = new FormData();
    formData.append("certificate", fileObj);
    try {
      const res = await fetch("http://localhost:5000/api/ocr", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("OCR API Response:", data);
      setOcrResult(data);
    } catch (err) {
      setOcrResult({ error: "Failed to extract data." });
    }
    setLoading(false);
  };

  return (
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
            <h2 className="text-xl font-semibold mb-4">Upload a certificate file for validation.</h2>
            <form className="flex flex-col gap-4" onSubmit={handleOcrSubmit}>
              <label className="font-semibold">Upload Certificate
                <Input ref={fileInputRef} type="file" accept="application/pdf,image/png" onChange={handleFileChange} className={darkMode ? "bg-gray-900 text-white" : "bg-white text-black border-gray-300"} />
              </label>
              <Button type="submit" className="mt-4" disabled={!fileObj || loading}>{loading ? "Extracting..." : "Submit"}</Button>
            </form>
          </section>
        </div>
        {fileUrl && (
          <div className="mt-8 w-full max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-2">File Preview:</h3>
            {fileObj && fileObj.type === "application/pdf" ? (
              <iframe
                src={fileUrl}
                title="PDF Preview"
                width="100%"
                height="400px"
                className={darkMode ? "bg-gray-900 border border-gray-700 rounded" : "bg-white border border-gray-300 rounded"}
              />
            ) : (
              <img
                src={fileUrl}
                alt="Image Preview"
                style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "0.5rem", border: darkMode ? "1px solid #374151" : "1px solid #d1d5db" }}
              />
            )}
          </div>
        )}
        {ocrResult && (
          <div className={darkMode ? "mt-8 w-full max-w-2xl mx-auto bg-gray-800 rounded-xl p-6 shadow-lg" : "mt-8 w-full max-w-2xl mx-auto bg-gray-100 rounded-xl p-6 shadow-lg"}>
            <h3 className="text-xl font-bold mb-4 text-center">Extracted Certificate Data</h3>
            {ocrResult.error ? (
              <div className="text-red-500 text-center">{ocrResult.error}</div>
            ) : (
              <>
                <div className="flex justify-center items-center mb-6">
                  {ocrResult.status === "valid" && (
                    <span className="text-green-500 text-2xl mr-2">✅</span>
                  )}
                  {ocrResult.status === "invalid" && (
                    <span className="text-red-500 text-2xl mr-2">❌</span>
                  )}
                  {ocrResult.status === "suspicious" && (
                    <span className="text-yellow-400 text-2xl mr-2">⚠️</span>
                  )}
                  <span className={
                    ocrResult.status === "valid" ? "text-green-500 font-bold text-lg" :
                    ocrResult.status === "invalid" ? "text-red-500 font-bold text-lg" :
                    "text-yellow-400 font-bold text-lg"
                  }>
                    {ocrResult.status === "valid" && "Valid"}
                    {ocrResult.status === "invalid" && "Invalid"}
                    {ocrResult.status === "suspicious" && "Suspicious"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Name:</span>
                    <span className="text-right">{ocrResult.name || "Not found"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Marks:</span>
                    <span className="text-right">{ocrResult.marks || "Not found"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Certificate ID:</span>
                    <span className="text-right">{ocrResult.certificateId || "Not found"}</span>
                  </div>
                </div>
              </>
            )}
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
  );
}
