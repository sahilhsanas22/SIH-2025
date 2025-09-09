"use client";
import React from "react";
import { Button } from "../components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Login</h2>
        {/* Add your login form here */}
        <Button className="w-full mt-4">Sign In</Button>
      </div>
    </div>
  );
}
