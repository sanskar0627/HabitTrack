"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Local type definitions (matching API response)
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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [habits, setHabits] = useState<HabitWithLogs[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Edit state
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch habits after authentication
  useEffect(() => {
    if (status === "authenticated") {
      fetchHabits();
    }
  }, [status]);

  async function fetchHabits() {
    try {
      setErrorMsg("");
      const res = await fetch("/api/habits");
      if (!res.ok) throw new Error("Failed to fetch habits");
      const data: HabitWithLogs[] = await res.json();
      setHabits(data);
    } catch (error) {
      console.error("Error loading habits:", error);
      setErrorMsg("⚠ Could not load habits. Please refresh.");
    }
  }

  function hasLoggedToday(habit: HabitWithLogs) {
    const today = new Date().toDateString();
    return habit.logs.some(
      (log: HabitLog) => new Date(log.date).toDateString() === today
    );
  }

  function calculateStreak(habit: HabitWithLogs) {
    const days = habit.logs
      .map((log: HabitLog) => new Date(log.date).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a);
    if (days.length === 0) return 0;
    let streak = 1;
    let prevDay = days[0];
    for (let i = 1; i < days.length; i++) {
      if (prevDay - days[i] === 86400000) {
        streak++;
        prevDay = days[i];
      } else break;
    }
    return streak;
  }

  async function markDone(habitId: number) {
    setErrorMsg("");
    try {
      setMarking(true);
      const res = await fetch(`/api/habits/${habitId}/log`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to log habit");
      fetchHabits();
    } catch (error) {
      console.error(error);
      setErrorMsg("⚠ Could not log habit.");
    } finally {
      setMarking(false);
    }
  }

  async function addHabit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    if (!title.trim()) {
      setErrorMsg("⚠ Habit title cannot be empty.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error("Failed to add habit");
      const data: HabitWithLogs[] = await res.json();
      setHabits(data);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error(error);
      setErrorMsg("⚠ Could not add habit.");
    } finally {
      setLoading(false);
    }
  }

  // ---------- EDIT HABIT ----------
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

  // ---------- EDIT HABIT ----------
async function saveEdit() {
  if (!editTitle.trim()) {
    setErrorMsg("⚠ Title cannot be empty");
    return;
  }
  try {
    setLoading(true);
    const res = await fetch(`/api/habits/${editingHabitId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, description: editDescription }),
    });
    if (!res.ok) throw new Error("Failed to update habit");

    const updatedHabits: HabitWithLogs[] = await res.json();
    setHabits(updatedHabits);
    cancelEdit();
  } catch (error) {
    console.error(error);
    setErrorMsg("⚠ Could not update habit.");
  } finally {
    setLoading(false);
  }
}

// ---------- DELETE HABIT ----------
async function deleteHabit(habitId: number) {
  if (!confirm("Are you sure you want to delete this habit?")) return;
  try {
    setLoading(true);
    const res = await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete habit");

    const updatedHabits: HabitWithLogs[] = await res.json();
    setHabits(updatedHabits);
  } catch (error) {
    console.error(error);
    setErrorMsg("⚠ Could not delete habit.");
  } finally {
    setLoading(false);
  }
}

  if (status === "loading") {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {session?.user?.name || "User"}
      </h1>

      {/* Error Message */}
      {errorMsg && (
        <p className="mb-4 text-red-600 text-sm bg-red-50 p-2 rounded">
          {errorMsg}
        </p>
      )}

      {/* Add Habit Form */}
      <form onSubmit={addHabit} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Habit title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Habit"}
        </button>
      </form>

      {/* Habits List */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Your Habits</h2>
        {habits.length === 0 && (
          <p className="text-gray-500">No habits yet. Add one!</p>
        )}
        <ul className="space-y-2">
          {habits.map((habit) => {
            const doneToday = hasLoggedToday(habit);
            const streak = calculateStreak(habit);
            const isEditing = editingHabitId === habit.id;

            return (
              <li key={habit.id} className="p-3 border rounded bg-white shadow-sm">
                {!isEditing ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-lg">{habit.title}</p>
                      {habit.description && (
                        <p className="text-sm text-gray-500">
                          {habit.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">Streak: {streak} days</p>
                      <p className="text-xs text-gray-400">
                        Total completions: {habit.logs.length}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {doneToday && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Done Today
                        </span>
                      )}
                      <button
                        disabled={doneToday || marking}
                        onClick={() => markDone(habit.id)}
                        className={`px-3 py-1 rounded ${
                          doneToday
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                      >
                        {doneToday ? "✓" : "Mark Done"}
                      </button>
                      <button
                        onClick={() => startEdit(habit)}
                        className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
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
                      className="w-full p-2 border rounded"
                      placeholder="Habit Title"
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Description (optional)"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
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
      </div>
    </div>
  );
}
