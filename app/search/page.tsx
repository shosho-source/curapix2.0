"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  Play,
  Heart,
  Bookmark,
  Plus,
  MoreVertical,
} from "lucide-react";
import { MOCK_MOVIES, GENRES } from "@/lib/mock-data";
import { BottomNav } from "@/components/BottomNav";

const FILTERS = ["Trending", "New releases", "Top rated"] as const;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Trending");
  const [genre, setGenre] = useState<string | null>(null);

  const featured = MOCK_MOVIES[0];
  const popular = MOCK_MOVIES.slice(1, 6);
  const recommended = useMemo(
    () =>
      genre
        ? MOCK_MOVIES.filter((m) => m.genres.includes(genre))
        : MOCK_MOVIES,
    [genre]
  );

  return (
    <div className="min-h-dvh bg-white pb-24">
      <header className="flex items-center justify-between px-4 pt-5 pb-2">
        <h1 className="text-xl font-extrabold">CuraPix</h1>
        <div className="flex items-center gap-2">
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
        <div className="text-center mt-2 mb-4">
          <h2 className="text-2xl font-extrabold">✨ Search movies ✨</h2>
          <p className="text-sm text-muted mt-1">Find your next favorite movie</p>
        </div>

        <div className="flex items-center gap-2 bg-primary-50 rounded-full px-4 py-3 mb-3">
          <SearchIcon size={18} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies, genres, actors..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <SlidersHorizontal size={18} className="text-primary-500" />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap text-sm font-medium rounded-full px-3.5 py-1.5 flex items-center gap-1 ${
                filter === f
                  ? "bg-primary-500 text-white"
                  : "bg-primary-50 text-primary-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-6 bg-black">
          <Image
            src={featured.backdrop_url ?? featured.poster_url}
            alt={featured.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
          <span className="absolute top-3 left-3 bg-primary-500 text-white text-xs font-semibold rounded-full px-2.5 py-1">
            {featured.genres[0]}
          </span>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white text-xl font-bold">{featured.title}</p>
            <p className="text-white/80 text-sm mb-3">{featured.synopsis}</p>
            <button className="flex items-center gap-1.5 bg-white/95 text-ink text-sm font-semibold rounded-full px-3.5 py-1.5">
              <Play size={14} className="fill-ink" />
              Watch trailer
            </button>
          </div>
          <div className="absolute bottom-3 right-4 flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i === 0 ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Popular searches</h3>
            <Link href="#" className="text-xs text-primary-500 font-medium">
              View all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none">
            {popular.map((movie) => (
              <div key={movie.id} className="w-28 shrink-0">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-1.5">
                  <Image src={movie.poster_url} alt={movie.title} fill className="object-cover" />
                  <button className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                    <Heart size={12} />
                  </button>
                  <button className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                    <Bookmark size={12} />
                  </button>
                </div>
                <p className="text-xs font-semibold truncate">{movie.title}</p>
                <p className="text-[11px] text-muted">{movie.year} movies</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Genres</h3>
            <Link href="#" className="text-xs text-primary-500 font-medium">
              Explore all
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {GENRES.slice(0, 5).map((g) => (
              <button
                key={g}
                onClick={() => setGenre(genre === g ? null : g)}
                className={`whitespace-nowrap text-sm font-medium rounded-full px-3.5 py-1.5 ${
                  genre === g
                    ? "bg-primary-500 text-white"
                    : "bg-primary-50 text-primary-600"
                }`}
              >
                {g}
              </button>
            ))}
            <button className="whitespace-nowrap text-sm font-medium rounded-full px-3.5 py-1.5 bg-primary-50 text-primary-600">
              More
            </button>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Recommended for you</h3>
            <Link href="#" className="text-xs text-primary-500 font-medium">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {recommended.map((movie) => (
              <div key={movie.id}>
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-1">
                  <Image src={movie.poster_url} alt={movie.title} fill className="object-cover" />
                  <Bookmark size={12} className="absolute top-1.5 right-1.5 text-white drop-shadow" />
                </div>
                <p className="text-[11px] font-semibold truncate">{movie.title}</p>
                <p className="text-[10px] text-muted truncate">
                  {movie.year} • {movie.genres[0]}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
