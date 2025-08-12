"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";

type HabitLog = {
  id: number;
  date: string;
  habitId: number;
};

type HabitWithLogs = {
  id: number;
  title: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  logs: HabitLog[];
};

function getHighestStreak(habits: HabitWithLogs[]) {
  let max = 0;
  habits.forEach((habit) => {
    const streak = calculateStreak(habit);
    if (streak > max) max = streak;
  });
  return max;
}

function calculateStreak(habit: HabitWithLogs) {
  const days = habit.logs
    .map((log: HabitLog) => new Date(log.date).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a);
  if (!days.length) return 0;
  let streak = 1;
  let prevDay = days[0];
  for (let i = 1; i < days.length; i++) {
    if (prevDay - days[i] === 86400000) streak++, prevDay = days[i];
    else break;
  }
  return streak;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [habits, setHabits] = useState<HabitWithLogs[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);
  useEffect(() => {
    if (status === "authenticated") fetchHabits();
  }, [status]);
  async function fetchHabits() {
    try {
      setErrorMsg("");
      const res = await fetch("/api/habits");
      if (!res.ok) throw new Error();
      const data: HabitWithLogs[] = await res.json();
      setHabits(data);
    } catch {
      setErrorMsg("⚠ Could not load habits. Please refresh.");
    }
  }
  function hasLoggedToday(habit: HabitWithLogs) {
    const today = new Date().toDateString();
    return habit.logs.some(
      (log: HabitLog) => new Date(log.date).toDateString() === today
    );
  }
  async function markDone(habitId: number) {
    setErrorMsg("");
    try {
      setMarking(true);
      const res = await fetch(`/api/habits/${habitId}/log`, { method: "POST" });
      if (!res.ok) throw new Error();
      fetchHabits();
    } catch {
      setErrorMsg("⚠ Could not log habit.");
    } finally {
      setMarking(false);
    }
  }
  async function addHabit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    if (!title.trim()) return setErrorMsg("⚠ Habit title cannot be empty.");
    try {
      setLoading(true);
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error();
      const data: HabitWithLogs[] = await res.json();
      setHabits(data);
      setTitle("");
      setDescription("");
    } catch {
      setErrorMsg("⚠ Could not add habit.");
    } finally {
      setLoading(false);
    }
  }
  function startEdit(habit: HabitWithLogs) {
    setEditingHabitId(habit.id);
    setEditTitle(habit.title);
    setEditDescription(habit.description || "");
  }
  function cancelEdit() {
    setEditingHabitId(null);
    setEditTitle("");
    setEditDescription("");
  }
  async function saveEdit() {
    if (!editTitle.trim()) return setErrorMsg("⚠ Title cannot be empty");
    try {
      setLoading(true);
      const res = await fetch(`/api/habits/${editingHabitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      if (!res.ok) throw new Error();
      const updated: HabitWithLogs[] = await res.json();
      setHabits(updated);
      cancelEdit();
    } catch {
      setErrorMsg("⚠ Could not update habit.");
    } finally {
      setLoading(false);
    }
  }
  async function deleteHabit(habitId: number) {
    if (!confirm("Are you sure you want to delete this habit?")) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      const updated: HabitWithLogs[] = await res.json();
      setHabits(updated);
    } catch {
      setErrorMsg("⚠ Could not delete habit.");
    } finally {
      setLoading(false);
    }
  }

  function formatName(fullName: string | undefined | null) {
    if (!fullName) return "User";
    const first = fullName.trim().split(" ")[0];
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  }

  // Responsive, wide, premium layout
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white via-indigo-50 to-indigo-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-indigo-900 mb-1">
              Welcome, {formatName(session?.user?.name)}
            </h1>
            {/* Highest streak record */}
            <div className="mt-1 text-indigo-600 font-medium flex items-center gap-2">
              <FaCheckCircle />
              <span>
                Highest Personal Streak Record:{" "}
                <span className="font-bold">{getHighestStreak(habits)}</span> days
              </span>
            </div>
          </div>
          {/* Add Habit Form - Wide Spacious */}
          <form
            onSubmit={addHabit}
            className="flex gap-2 bg-white border border-indigo-100 shadow-lg rounded-2xl p-4 items-center w-full max-w-xl"
          >
            <input
              type="text"
              placeholder="Habit title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-indigo-700 text-white px-5 py-2 rounded-xl font-bold shadow hover:from-purple-700 hover:to-indigo-800 disabled:opacity-60 transition"
            >
              {loading ? "Adding..." : "Add Habit"}
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg shadow max-w-2xl">
            {errorMsg}
          </div>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-4 text-indigo-700">Your Habits</h2>
          {habits.length === 0 && <p className="text-gray-400">No habits yet. Add one!</p>}
          <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {habits.map((habit) => {
              const doneToday = hasLoggedToday(habit);
              const streak = calculateStreak(habit);
              const isEditing = editingHabitId === habit.id;

              return (
                <li
                  key={habit.id}
                  className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[230px] transition hover:shadow-2xl"
                  style={{ position: "relative" }} // ensure buttons stay in
                >
                  {!isEditing ? (
                    <>
                      <div>
                        <h3 className="font-bold text-lg text-indigo-700 mb-1">{habit.title}</h3>
                        {habit.description && (
                          <p className="text-sm text-gray-500 mb-2">{habit.description}</p>
                        )}
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-xs text-indigo-600 font-medium">🔥 Streak: {streak}</span>
                          <span className="text-xs text-gray-400">✅ Completions: {habit.logs.length}</span>
                        </div>
                        {doneToday && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold mb-1">
                            Done Today
                          </span>
                        )}
                      </div>
                      {/* BUTTONS: always contained, never overflow */}
                      <div className="flex gap-2 mt-4">
                        <button
                          disabled={doneToday || marking}
                          onClick={() => markDone(habit.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold shadow-lg text-white text-sm transition
                            ${
                              doneToday
                                ? "bg-gradient-to-r from-gray-300 to-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-600 hover:to-green-700"
                            }`}
                        >
                          <FaCheckCircle className="text-lg" />
                          Done
                        </button>
                        <button
                          onClick={() => startEdit(habit)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold shadow-lg transition text-sm"
                          style={{ zIndex: 1 }}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold shadow-lg transition text-sm"
                          style={{ zIndex: 1 }}
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </>
                  ) : (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await saveEdit();
                      }}
                      className="space-y-2"
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Habit Title"
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Description (optional)"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow font-semibold transition"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-xl shadow font-semibold transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
