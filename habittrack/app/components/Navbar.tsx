"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

// Helper function to get capitalized first name
function formatFirstName(fullNameOrEmail?: string | null) {
  if (!fullNameOrEmail) return "User";
  // If it's an email, take before @
  let base = fullNameOrEmail.includes("@")
    ? fullNameOrEmail.split("@")[0]
    : fullNameOrEmail;
  const first = base.trim().split(" ")[0];
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white bg-opacity-90 backdrop-blur-sm shadow-md">
      {/* Logo + App Name */}
      <Link href="/" className="flex items-center gap-3 group">
        <img
          src="/ha.png"
          alt="HabitTracker Logo"
          width={40}
          height={40}
          className="rounded-full object-contain shadow-sm group-hover:scale-105 transition-transform duration-300"
        />
        <span className="text-2xl font-extrabold text-indigo-700 group-hover:text-indigo-900 transition-colors duration-300">
          HabitTracker
        </span>
      </Link>

      {/* User Info or Auth Links */}
      <div className="flex items-center gap-4">
        {status === "authenticated" ? (
          <>
            <span className="text-sm text-indigo-700 font-medium">
              {formatFirstName(session.user?.name || session.user?.email)}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-transform transform hover:scale-105"
            >
              {/* Adding a logout icon (optional) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4.5A1.5 1.5 0 014.5 3h5a.5.5 0 010 1h-5A.5.5 0 004 4.5v11a.5.5 0 00.5.5h5a.5.5 0 010 1h-5A1.5 1.5 0 013 15.5v-11zM13.854 5.146a.5.5 0 10-.708.708L15.293 8H8.5a.5.5 0 000 1h6.793l-2.147 2.146a.5.5 0 10.708.708l3-3a.498.498 0 000-.708l-3-3z"
                  clipRule="evenodd"
                />
              </svg>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-indigo-700 font-medium hover:text-indigo-900 transition-colors duration-300"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-purple-400 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-purple-800 transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
