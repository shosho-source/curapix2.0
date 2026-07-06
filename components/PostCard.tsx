"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreVertical } from "lucide-react";
import type { Post } from "@/lib/types";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${n}`;
}

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(Boolean(post.liked_by_me));
  const [bookmarked, setBookmarked] = useState(Boolean(post.bookmarked_by_me));
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [bookmarkCount, setBookmarkCount] = useState(post.bookmark_count);

  function toggleLike() {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  }

  function toggleBookmark() {
    setBookmarked((prev) => {
      setBookmarkCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  }

  const images = post.image_urls;

  return (
    <article className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
            {post.author.avatar_url && (
              <Image
                src={post.author.avatar_url}
                alt={post.author.display_name}
                fill
                className="object-cover"
              />
            )}
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 ring-1 ring-white" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">
              {post.author.display_name}
            </p>
            <p className="text-xs text-muted leading-tight">
              {timeAgo(post.created_at)}
            </p>
          </div>
        </div>
        <button aria-label="More options">
          <MoreVertical size={18} className="text-muted" />
        </button>
      </div>

      <div
        className={`grid gap-0.5 ${
          images.length === 1
            ? "grid-cols-1"
            : images.length === 2
            ? "grid-cols-2"
            : "grid-cols-2"
        }`}
      >
        {images.map((src, i) => (
          <div
            key={src + i}
            className={`relative aspect-square ${
              images.length === 3 && i === 0 ? "col-span-2" : ""
            }`}
          >
            <Image src={src} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 px-3 py-3">
        <button
          onClick={toggleLike}
          className="flex items-center gap-1"
          aria-label="Like"
        >
          <Heart
            size={20}
            className={liked ? "fill-primary-500 text-primary-500" : "text-ink"}
          />
          <span className="text-xs text-muted">{formatCount(likeCount)}</span>
        </button>
        <button className="flex items-center gap-1" aria-label="Comment">
          <MessageCircle size={20} className="text-ink" />
          <span className="text-xs text-muted">
            {formatCount(post.comment_count)}
          </span>
        </button>
        <button className="flex items-center gap-1" aria-label="Share">
          <Send size={20} className="text-ink" />
          <span className="text-xs text-muted">
            {formatCount(post.share_count)}
          </span>
        </button>
        <button
          onClick={toggleBookmark}
          className="flex items-center gap-1 ml-auto"
          aria-label="Bookmark"
        >
          <Bookmark
            size={20}
            className={bookmarked ? "fill-primary-500 text-primary-500" : "text-ink"}
          />
          <span className="text-xs text-muted">
            {formatCount(bookmarkCount)}
          </span>
        </button>
      </div>
    </article>
  );
}
