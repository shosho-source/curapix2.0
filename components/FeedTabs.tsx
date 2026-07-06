"use client";

import { useState } from "react";
import type { FeedTab, Post } from "@/lib/types";
import { PostCard } from "./PostCard";

const TABS: { key: FeedTab; label: string }[] = [
  { key: "global", label: "Global" },
  { key: "friends", label: "Friends" },
  { key: "recommended", label: "Recommended" },
];

export function FeedTabs({ posts }: { posts: Post[] }) {
  const [active, setActive] = useState<FeedTab>("global");

  return (
    <div>
      <div className="flex bg-primary-50 rounded-full p-1 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`flex-1 text-sm font-medium py-2 rounded-full transition-colors ${
              active === tab.key
                ? "bg-white text-primary-600 shadow-sm"
                : "text-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
