"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Conversation, Profile } from "@/lib/types";

const TABS = ["Favourites", "General", "Requests"] as const;

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function ConversationList({
  me,
  conversations,
}: {
  me: Profile;
  conversations: Conversation[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Favourites");
  const [query, setQuery] = useState("");

  const visible = conversations.filter((c) =>
    c.participants[0]?.display_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-2 bg-primary-50 rounded-full px-4 py-3 mb-5">
        <Search size={18} className="text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-none mb-5">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="w-14 h-14 rounded-full ring-2 ring-primary-200 overflow-hidden relative">
            {me.avatar_url && (
              <Image src={me.avatar_url} alt="You" fill className="object-cover" />
            )}
          </div>
          <p className="text-[11px] text-muted">Your note</p>
        </div>
        {conversations.map((c, i) => {
          const p = c.participants[0];
          if (!p) return null;
          return (
            <div key={p.id} className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-14 h-14 rounded-full ring-2 ring-primary-100 overflow-hidden relative">
                {p.avatar_url && (
                  <Image src={p.avatar_url} alt={p.display_name} fill className="object-cover" />
                )}
                <span
                  className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                    i % 3 === 0 ? "bg-slate-400" : "bg-green-500"
                  }`}
                />
              </div>
              <p className="text-[11px] text-muted">{p.display_name}</p>
            </div>
          );
        })}
      </div>

      <div className="flex bg-primary-50 rounded-full p-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-sm font-medium py-2 rounded-full transition-colors ${
              tab === t ? "bg-white text-primary-600 shadow-sm" : "text-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="divide-y divide-primary-50">
        {visible.map((c) => {
          const p = c.participants[0];
          if (!p) return null;
          return (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="flex items-center gap-3 py-3"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                {p.avatar_url && (
                  <Image src={p.avatar_url} alt={p.display_name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{p.display_name}</p>
                <p className="text-sm truncate text-muted">
                  {c.last_message?.body}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-xs text-muted">
                  {c.last_message ? timeAgo(c.last_message.created_at) : ""}
                </span>
                {c.unread_count > 0 && (
                  <span className="w-2 h-2 rounded-full bg-primary-500" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
