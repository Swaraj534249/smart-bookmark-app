"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
};

type Props = {
  userId: string;
  initialBookmarks: Bookmark[];
};

export default function BookmarkList({ userId, initialBookmarks }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setBookmarks((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !url.trim()) {
      setError("Both title and URL are required.");
      return;
    }

    // Simple URL check
    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    setLoading(true);
    const { error: insertError } = await supabase.from("bookmarks").insert({
      title: title.trim(),
      url: finalUrl,
      user_id: userId,
    });

    setLoading(false);

    if (insertError) {
      setError("Failed to add bookmark. Please try again.");
    } else {
      setTitle("");
      setUrl("");
    }
  }

  async function handleDelete(id: string) {
    await supabase.from("bookmarks").delete().eq("id", id).eq("user_id", userId);
  }

  return (
    <div className="space-y-6">
      {/* Add Bookmark Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Add a Bookmark
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            type="text"
            placeholder="Title  (e.g. Hacker News)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="URL  (e.g. https://news.ycombinator.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            {loading ? "Adding…" : "Add Bookmark"}
          </button>
        </form>
      </div>

      {/* Bookmark List */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">
          Your Bookmarks{" "}
          <span className="text-gray-400 font-normal">({bookmarks.length})</span>
        </h2>

        {bookmarks.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400 text-sm">
            No bookmarks yet. Add one above!
          </div>
        ) : (
          <ul className="space-y-2">
            {bookmarks.map((bookmark) => (
              <li
                key={bookmark.id}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow"
              >
                <div className="min-w-0">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-800 hover:text-blue-600 transition-colors text-sm block truncate"
                  >
                    {bookmark.title}
                  </a>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {bookmark.url}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  className="shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Delete bookmark"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
