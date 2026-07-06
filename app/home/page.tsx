import { Bell, Plus, MoreVertical, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MOCK_POSTS } from "@/lib/mock-data";
import { FeedTabs } from "@/components/FeedTabs";
import { BottomNav } from "@/components/BottomNav";
import type { Post } from "@/lib/types";

async function getPosts(): Promise<Post[]> {
  const supabase = createClient();
  if (!supabase) return MOCK_POSTS;

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, user_id, image_urls, caption, created_at, like_count, comment_count, share_count, bookmark_count, author:users(id, username, display_name, avatar_url)"
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return MOCK_POSTS;
  return data as unknown as Post[];
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="min-h-dvh bg-white pb-24">
      <header className="flex items-center justify-between px-4 pt-5 pb-3">
        <h1 className="text-xl font-extrabold">CuraPix</h1>
        <div className="flex items-center gap-2">
          <button
            aria-label="Notifications"
            className="flex items-center gap-1 rounded-full border border-primary-100 px-2.5 py-1.5"
          >
            <Bell size={17} />
            <ChevronDown size={14} className="text-muted" />
          </button>
          <button
            aria-label="New post"
            className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center"
          >
            <Plus size={18} className="text-primary-600" />
          </button>
          <button aria-label="More" className="w-9 h-9 flex items-center justify-center">
            <MoreVertical size={18} />
          </button>
        </div>
      </header>

      <main className="px-4">
        <FeedTabs posts={posts} />
      </main>

      <BottomNav avatarUrl={posts[0]?.author.avatar_url} username={posts[0]?.author.username} />
    </div>
  );
}
