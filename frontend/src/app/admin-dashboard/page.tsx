"use client";
import React from "react";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-2xl flex flex-col items-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Admin Dashboard</h1>
        <p className="text-slate-700 text-center">Welcome, Admin! This is your dashboard.</p>
      </div>
    </div>
  );
}
