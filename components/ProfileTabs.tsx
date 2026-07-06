"use client";

import { useState } from "react";
import Image from "next/image";
import { Grid3x3, Camera, Eye, ListMusic, Bookmark } from "lucide-react";
import type { Post } from "@/lib/types";

const TABS = [
  { key: "grid", icon: Grid3x3 },
  { key: "camera", icon: Camera },
  { key: "eye", icon: Eye },
  { key: "music", icon: ListMusic },
  { key: "saved", icon: Bookmark },
] as const;

export function ProfileTabs({ posts }: { posts: Post[] }) {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("grid");

  return (
    <div>
      <div className="flex justify-between border-b border-primary-50 mb-1">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex-1 flex items-center justify-center py-3 border-b-2 ${
              active === key ? "border-primary-500 text-primary-500" : "border-transparent text-muted"
            }`}
            aria-label={key}
          >
            <Icon size={19} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-0.5">
        {posts.flatMap((p) => p.image_urls).map((src, i) => (
          <div key={src + i} className="relative aspect-square">
            <Image src={src} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
