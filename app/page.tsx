"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaChartLine, FaCheckCircle, FaMobileAlt, FaUsers } from "react-icons/fa";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect logged-in users straight to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-white via-indigo-50 to-indigo-100 text-gray-900">
      {/* NAVBAR */}
      <header className="flex items-center justify-between px-8 py-4 fixed top-0 w-full bg-white bg-opacity-90 backdrop-blur-sm shadow-md z-50 transition-colors duration-300">
        {/* Left: Logo + Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/ha.png"
            alt="HabitTracker Logo"
            width={40}
            height={40}
            className="rounded object-cover transform group-hover:scale-110 transition-transform duration-300"
          />
          <span className="text-2xl font-extrabold text-indigo-700 group-hover:text-indigo-900 transition-colors duration-300">
            HabitTracker
          </span>
        </Link>

        {/* Right: Nav Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-indigo-700 font-medium hover:text-indigo-900 transition-colors duration-300"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-purple-400 text-white px-5 py-2 rounded-lg font-semibold shadow-lg hover:bg-purple-800 active:scale-95 transform transition duration-150"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center flex-1 pt-32 pb-24 px-6 text-center max-w-4xl mx-auto animate-fadeIn">
        <h1 className="text-6xl font-extrabold leading-tight max-w-3xl mb-6 text-indigo-900 drop-shadow-lg">
          Build Positive Habits. Transform Your Life.
        </h1>
        <p className="text-xl text-indigo-700 max-w-2xl mb-10 tracking-wide">
          Unlock your full potential with HabitTracker — track progress, stay motivated, and celebrate every win with an inspiring daily plan.
        </p>
        <div className="flex gap-6">
          <Link
            href="/signup"
            className="bg-purple-400 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-purple-800:scale-95 transform transition duration-150  hover:bg-purple-800"
          >
            Get Started — It’s Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 rounded-full font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 active:scale-95 transform transition duration-150"
          >
            Login
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 text-indigo-900">Why HabitTracker?</h2>
        <div className="grid md:grid-cols-4 gap-10">
          <FeatureCard
            icon={<FaChartLine className="text-indigo-600 text-4xl mb-5" />}
            title="Track Your Progress"
            description="Visualize your streaks and success with intuitive charts and stats."
          />
          <FeatureCard
            icon={<FaCheckCircle className="text-green-600 text-4xl mb-5" />}
            title="Stay Consistent"
            description="Daily reminders and an easy-to-use interface keep you motivated."
          />
          <FeatureCard
            icon={<FaMobileAlt className="text-purple-600 text-4xl mb-5" />}
            title="Accessible Anywhere"
            description="Seamlessly switch between devices and stay in sync wherever you go."
          />
          <FeatureCard
            icon={<FaUsers className="text-orange-500 text-4xl mb-5" />}
            title="Community Support"
            description="Join thousands staying accountable and achieving their goals together."
          />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-indigo-50 py-20 px-6">
        <h2 className="text-4xl font-bold text-center mb-16 text-indigo-800">What Our Users Say</h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <Testimonial
            quote="HabitTracker changed my life! I finally maintain consistency and enjoy the journey."
            author="Sanskar Shukla"
          />
          <Testimonial
            quote="With HabitTracker, I've built habits that last. The streaks keep me pushing forward."
            author="Jaynt Jha."
          />
          <Testimonial
            quote="The reminders and insights are exactly what I needed. This app makes habit-building fun."
            author="Priya K."
          />
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-400 via-purple-700 to-indigo-400 text-white text-center rounded-t-3xl">
        <h2 className="text-4xl font-extrabold mb-4 drop-shadow-lg">Ready to transform your life?</h2>
        <p className="mb-8 text-lg max-w-xl mx-auto tracking-wide drop-shadow-sm">
          Join HabitTracker today and start building habits that drive real results.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-white text-indigo-700 px-10 py-4 rounded-full font-bold shadow-lg hover:bg-gray-100 active:scale-95 transition transform duration-150"
        >
          Create Your Free Account
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-indigo-200 py-8 text-center text-indigo-700 text-sm tracking-wide">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} HabitTracker Inc. All rights reserved.</p>
          <div className="space-x-6">
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease forwards;
        }
      `}</style>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      {icon}
      <h3 className="text-xl font-semibold mb-2 text-indigo-900">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}

function Testimonial({ quote, author }: { quote: string; author: string }) {
  return (
    <div className="bg-white p-7 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <p className="mb-6 italic text-indigo-800">“{quote}”</p>
      <p className="text-indigo-600 font-semibold">— {author}</p>
    </div>
  );
}
