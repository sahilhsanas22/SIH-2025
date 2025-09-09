"use client";
import React, { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const roles = ["admin", "authenticator"];

export default function LoginForm() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("admin");
  const [slide, setSlide] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRoleChange = (role: string) => {
    setSlide(true);
    setTimeout(() => {
      setSelectedRole(role);
      setForm({ username: "", password: "" });
      setSlide(false);
    }, 300);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (selectedRole === "admin") {
      try {
        const res = await fetch("http://localhost:5000/api/admin-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: form.username, password: form.password })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            router.push("/admin-dashboard");
          }, 1200);
        } else {
          setErrorMsg(data.error || "Invalid credentials");
        }
      } catch (err) {
        setErrorMsg("Server error. Please try again.");
      }
      return;
    }
    if (selectedRole === "authenticator") {
      try {
        const res = await fetch("http://localhost:5000/api/authenticator-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: form.username, password: form.password })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            router.push("/inputform");
          }, 1200);
        } else {
          setErrorMsg(data.error || "Invalid credentials");
        }
      } catch (err) {
        setErrorMsg("Server error. Please try again.");
      }
      return;
    }
    alert(`Role: ${selectedRole}\nUsername: ${form.username}\nPassword: ${form.password}`);
  };

  // Simple background color for sliding animation
  const bgColor = selectedRole === "admin" ? "bg-slate-50" : "bg-slate-100";

  return (
    <div className={`w-full max-w-md relative transition-colors duration-300 ${bgColor} rounded-xl border border-slate-200 py-8 px-4`} style={{ minHeight: '20rem' }}>
      {showSuccess && (
        <div className="absolute top-[-2.5rem] left-1/2 -translate-x-1/2 z-10 bg-green-600 text-white px-6 py-2 rounded shadow-lg text-base font-semibold animate-fade-in-out">
          Successfully logged in!
        </div>
      )}
      {errorMsg && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-red-600 text-white px-6 py-2 rounded shadow-lg text-base font-semibold animate-fade-in-out">
          {errorMsg}
        </div>
      )}
      <div className="flex justify-center mb-6 gap-2">
        {roles.map((role) => (
          <Button
            key={role}
            className={`px-5 py-2 font-medium rounded transition-all duration-200 border-2 ${selectedRole === role ? 'bg-slate-700 text-white border-slate-700 hover:bg-slate-800' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
            onClick={() => handleRoleChange(role)}
            disabled={slide}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Button>
        ))}
      </div>
      <div className="relative w-full flex justify-center items-center" style={{ minHeight: '12rem' }}>
        <form
          className={`absolute left-0 top-0 w-full transition-transform duration-300 ${slide ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'} bg-white rounded-lg p-6 flex flex-col items-center border border-slate-200`}
          onSubmit={handleSubmit}
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-4">{selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Login</h2>
          <Input
            name="username"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="mb-3 w-full bg-slate-50 border border-slate-300 text-slate-900 rounded px-3 py-2"
            required
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="mb-3 w-full bg-slate-50 border border-slate-300 text-slate-900 rounded px-3 py-2"
            required
          />
          <Button className="w-full mt-2 bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 rounded">Sign In</Button>
        </form>
      </div>
      <style>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(-10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 1.2s ease;
        }
      `}</style>
    </div>
  );
}
