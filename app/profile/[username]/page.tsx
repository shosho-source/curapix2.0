import Image from "next/image";
import { MoreVertical, UserPlus, Share2, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MOCK_POSTS, MOCK_PROFILES } from "@/lib/mock-data";
import { BottomNav } from "@/components/BottomNav";
import { ProfileTabs } from "@/components/ProfileTabs";
import { NewPostButton } from "@/components/NewPostButton";
import type { Profile, Post } from "@/lib/types";

const HIGHLIGHTS = [
  { label: "Cried", emoji: "😢" },
  { label: "Home", emoji: "🏠" },
  { label: "My Top 10", emoji: "⭐" },
  { label: "Nostalgia", emoji: "📼" },
  { label: "Comfort", emoji: "☁️" },
];

async function getProfile(username: string): Promise<{
  profile: Profile;
  posts: Post[];
  stats: { posts: number; followers: number; following: number };
}> {
  const supabase = await createClient();
  if (!supabase) {
    return {
      profile: MOCK_PROFILES[0],
      posts: MOCK_POSTS,
      stats: { posts: 40, followers: 3160, following: 1400 },
    };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, user_id, image_urls, created_at, like_count, comment_count, share_count, bookmark_count")
    .eq("user_id", profile?.id)
    .order("created_at", { ascending: false });

  const { count: followers } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile?.id);

  const { count: following } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile?.id);

  return {
    profile: (profile as Profile) ?? MOCK_PROFILES[0],
    posts: (posts as unknown as Post[]) ?? [],
    stats: {
      posts: posts?.length ?? 0,
      followers: followers ?? 0,
      following: following ?? 0,
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { profile, posts, stats } = await getProfile(username);

  return (
    <div className="min-h-dvh bg-white pb-24">
      <header className="flex items-center justify-between px-4 pt-5 pb-3">
        <button className="flex items-center gap-1 font-semibold text-sm">
          {profile.username}
          <span className="text-xs text-muted">▾</span>
        </button>
        <div className="flex items-center gap-2">
          <NewPostButton />
          <button className="w-9 h-9 flex items-center justify-center">
            <MoreVertical size={18} />
          </button>
        </div>
      </header>

      <main className="px-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-20 h-20 rounded-full ring-2 ring-primary-200 overflow-hidden shrink-0">
            {profile.avatar_url && (
              <Image src={profile.avatar_url} alt={profile.display_name} fill className="object-cover" />
            )}
            <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-500 ring-2 ring-white" />
          </div>
          <div>
            <p className="font-bold text-lg">{profile.display_name}</p>
            <div className="flex gap-4 mt-1 text-sm">
              <span>
                <strong>{stats.posts}</strong>{" "}
                <span className="text-muted">Posts</span>
              </span>
              <span>
                <strong>{stats.followers.toLocaleString()}</strong>{" "}
                <span className="text-muted">Followers</span>
              </span>
              <span>
                <strong>{stats.following.toLocaleString()}</strong>{" "}
                <span className="text-muted">Following</span>
              </span>
            </div>
          </div>
        </div>

        {!profile.bio && (
          <button className="flex items-center gap-1.5 text-sm text-muted border border-primary-100 rounded-full px-3.5 py-1.5 mb-4">
            <Pencil size={13} />
            Add a great bio here
          </button>
        )}
        {profile.bio && <p className="text-sm mb-4">{profile.bio}</p>}

        <div className="flex gap-2 overflow-x-auto scrollbar-none mb-4">
          {profile.genre_prefs.map((g) => (
            <span
              key={g}
              className="whitespace-nowrap text-sm font-medium rounded-full px-3.5 py-1.5 bg-primary-50 text-primary-600"
            >
              {g}
            </span>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <button className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-primary-100 py-2.5 text-sm font-semibold">
            <Pencil size={14} />
            Edit Profile
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-primary-100 py-2.5 text-sm font-semibold">
            <Share2 size={14} />
            Share Profile
          </button>
          <button className="w-11 h-11 rounded-full border border-primary-100 flex items-center justify-center shrink-0">
            <UserPlus size={16} />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-none mb-6">
          {HIGHLIGHTS.map((h) => (
            <div key={h.label} className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-14 h-14 rounded-full bg-primary-50 ring-1 ring-primary-100 flex items-center justify-center text-xl">
                {h.emoji}
              </div>
              <p className="text-[11px] text-muted whitespace-nowrap">{h.label}</p>
            </div>
          ))}
        </div>

        <ProfileTabs posts={posts} />
      </main>

      <BottomNav avatarUrl={profile.avatar_url} username={profile.username} />
    </div>
  );
}
