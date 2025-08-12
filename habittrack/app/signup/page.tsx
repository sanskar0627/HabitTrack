"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function validateEmail(email: string) {
  // Gmail only
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return gmailRegex.test(email);
}

function validatePassword(password: string) {
  return password.length >= 6;
}

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!validateEmail(form.email)) {
      setError("Please enter a valid Email address.");
      return;
    }
    if (!validatePassword(form.password)) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        // Success message inline, then redirect
        setError("Account created! Please log in.");
        setTimeout(() => router.push("/login"), 1000);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-indigo-50 to-indigo-100 px-4">
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-indigo-700 mb-2 text-center">Create Your Account</h1>
        <p className="text-gray-600 text-center mb-6">Join HabitTracker and start building better habits!</p>

        {error && (
          <div className="text-center my-3">
            <p className={`text-sm ${error.startsWith("Account created") ? "text-green-600" : "text-red-600"}`}>
              {error}
            </p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Full Name"
            value={form.name}
            onChange={updateField}
            className="w-full px-4 py-2 rounded-md border border-indigo-200 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email address"
            value={form.email}
            onChange={updateField}
            className="w-full px-4 py-2 rounded-md border border-indigo-200 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <input
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Password (min. 6 characters)"
            value={form.password}
            onChange={updateField}
            className="w-full px-4 py-2 rounded-md border border-indigo-200 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md bg-purple-500 text-white text-lg font-semibold shadow-md hover:bg-purple-700 transition focus:ring-2 focus:ring-purple-400"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        {/* Links */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-2">
          <Link href="/login" className="text-indigo-700 hover:underline text-sm">
            Already have an account? Sign In
          </Link>
          <Link href="/forgot-password" className="text-purple-700 hover:underline text-sm">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}
