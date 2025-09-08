"use client";
import React from "react";
import { Button } from "../components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 flex flex-col">
      <nav className="w-full bg-slate-800 text-white flex items-center justify-between px-8 py-4 shadow-md">
        <span className="text-2xl font-bold tracking-wide">Government of Jharkhand</span>
        <Button className="px-6 py-2 text-base font-semibold rounded-lg bg-slate-700 hover:bg-slate-900 shadow" style={{marginLeft: 'auto'}}>Login</Button>
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white/80 rounded-2xl shadow-xl p-10 flex flex-col items-center max-w-2xl mt-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-wide">Government of Jharkhand</h1>
          <p className="text-base text-slate-700 mb-8 text-center">
            With increasing digitization, the problem of fake degrees and forged academic certificates has become a major concern for higher education institutions, employers, and government bodies. Cases of fraudulent documents being used for jobs, admissions, or government schemes have highlighted the absence of a robust mechanism to verify the authenticity of educational credentials issued by colleges and universities.<br /><br />
            At present, verification is often manual, relying on physical inspection, emails to institutions, or outdated databases. This creates delays, inconsistency, and susceptibility to corruption or manipulation. To preserve academic integrity and public trust, there is a pressing need for an efficient, secure, and scalable digital system to detect and prevent the use of fake degrees.
          </p>
        </div>
      </main>
    </div>
  );
}
