import { SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MOCK_MOVIES } from "@/lib/mock-data";
import { SwipeDeck } from "@/components/SwipeDeck";
import { BottomNav } from "@/components/BottomNav";
import type { Movie } from "@/lib/types";

async function getMovies(): Promise<Movie[]> {
  const supabase = await createClient();
  if (!supabase) return MOCK_MOVIES.slice(0, 5);

  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .limit(10);

  if (error || !data) return MOCK_MOVIES.slice(0, 5);
  return data as Movie[];
}

export default async function ExplorePage() {
  const movies = await getMovies();

  return (
    <div className="min-h-dvh bg-white pb-24">
      <header className="flex items-center justify-between px-4 pt-5 pb-1">
        <h1 className="text-xl font-extrabold">CuraPix</h1>
        <button
          aria-label="Filters"
          className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center"
        >
          <SlidersHorizontal size={16} className="text-primary-600" />
        </button>
      </header>

      <div className="px-4 pt-2 pb-4">
        <h2 className="text-3xl font-extrabold tracking-tight">EXPLORE</h2>
      </div>

      <main className="px-4 pt-6">
        <SwipeDeck movies={movies} />
      </main>

      <BottomNav />
    </div>
  );
}
