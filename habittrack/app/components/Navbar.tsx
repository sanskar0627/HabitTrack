"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      {/* Left: App Name/Logo */}
      <Link href="/dashboard" className="flex items-center space-x-2">
        <Image
          src="/logo.jpg"
          alt="HabitTracker Logo"
          width={40}
          height={40}
          className="rounded"
        />

        <span className="text-lg font-bold hover:text-gray-300">
          HabitTracker
        </span>
      </Link>

      {/* Right: Links & User */}
      <div className="flex items-center space-x-4">
        {status === "authenticated" && (
          <>
            <span className="text-sm text-gray-300">
              {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
