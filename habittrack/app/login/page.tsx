"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

// Gmail validation
function validateEmail(email: string) {
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return gmailRegex.test(email.trim());
}
function validatePassword(password: string) {
  return password.length >= 6;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Always store email as lowercase
  const updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "email" ? value.toLowerCase() : value,
    }));
    setError(""); // Clear errors as user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(form.email)) {
      setError("Please enter a valid Gmail address.");
      return;
    }
    if (!validatePassword(form.password)) {
      setError("Please enter a valid password (min. 6 characters).");
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (result?.error) {
      setError("Credentials do not match. Please try again.");
    } else if (result?.ok) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-indigo-50 to-indigo-100 px-4">
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-indigo-700 mb-2 text-center">Welcome Back</h1>
        <p className="text-gray-600 text-center mb-6">
          Log in to continue building your positive habits.
        </p>

        {error && (
          <div className="text-center my-3">
            <p className="text-sm text-red-600 font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Your Gmail address"
            value={form.email}
            onChange={updateField}
            className="w-full px-4 py-2 rounded-md border border-indigo-200 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
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
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Links */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-2">
          <Link href="/signup" className="text-indigo-700 hover:underline text-sm">
            Don't have an account? Sign Up
          </Link>
          <Link href="/forgot-password" className="text-purple-700 hover:underline text-sm">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}
