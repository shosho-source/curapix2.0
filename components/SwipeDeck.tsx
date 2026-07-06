"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { Bookmark, RotateCcw } from "lucide-react";
import type { Movie } from "@/lib/types";

const SWIPE_THRESHOLD = 120;

export function SwipeDeck({ movies }: { movies: Movie[] }) {
  const [deck, setDeck] = useState(movies);
  const [history, setHistory] = useState<
    { movie: Movie; direction: "left" | "right" }[]
  >([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [showWatchlist, setShowWatchlist] = useState(false);

  const total = movies.length;
  const current = deck[0];
  const cardNumber = total - deck.length + 1;

  function commitSwipe(direction: "left" | "right") {
    if (!current) return;
    setHistory((h) => [...h, { movie: current, direction }]);
    if (direction === "right") {
      setWatchlist((w) => [...w, current]);
    }
    setDeck((d) => d.slice(1));
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      commitSwipe("right");
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      commitSwipe("left");
    }
  }

  function undo() {
    setHistory((h) => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      setDeck((d) => [last.movie, ...d]);
      if (last.direction === "right") {
        setWatchlist((w) => w.filter((m) => m.id !== last.movie.id));
      }
      return h.slice(0, -1);
    });
  }

  function toggleBookmark(movie: Movie) {
    setWatchlist((w) =>
      w.some((m) => m.id === movie.id)
        ? w.filter((m) => m.id !== movie.id)
        : [...w, movie]
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => setShowWatchlist(true)}
        className="self-start flex items-center gap-1.5 bg-primary-100 text-primary-600 text-sm font-medium rounded-full px-3.5 py-1.5 mb-6"
      >
        <Bookmark size={15} />
        Watchlist{watchlist.length > 0 ? ` (${watchlist.length})` : ""}
      </button>

      <div className="relative w-64 h-96">
        {deck.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <p className="font-semibold text-lg">That&apos;s everything</p>
            <p className="text-sm text-muted mt-1">
              Check your watchlist or come back later for more picks.
            </p>
          </div>
        )}

        {deck
          .slice(0, 3)
          .reverse()
          .map((movie, i) => {
            const depth = deck.slice(0, 3).length - 1 - i;
            const isTop = depth === 0;
            return (
              <motion.div
                key={movie.id}
                className="absolute inset-0 rounded-2xl overflow-hidden shadow-card bg-black"
                style={{ zIndex: 10 - depth }}
                initial={{ scale: 1 - depth * 0.05, y: depth * 10 }}
                animate={{ scale: 1 - depth * 0.05, y: depth * 10 }}
                drag={isTop ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={isTop ? handleDragEnd : undefined}
                whileDrag={{ rotate: 8 }}
                exit={{ x: 0, opacity: 0 }}
              >
                <Image
                  src={movie.poster_url}
                  alt={movie.title}
                  fill
                  className="object-cover pointer-events-none"
                  sizes="256px"
                />
                {isTop && (
                  <button
                    onClick={() => toggleBookmark(movie)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center"
                    aria-label="Bookmark"
                  >
                    <Bookmark
                      size={16}
                      className={
                        watchlist.some((m) => m.id === movie.id)
                          ? "fill-primary-500 text-primary-500"
                          : "text-ink"
                      }
                    />
                  </button>
                )}
                {isTop && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-2 px-3">
                    <p className="text-white font-bold tracking-wide text-sm">
                      {movie.title.toUpperCase()}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
      </div>

      {current && (
        <div className="text-center mt-4">
          <p className="font-bold text-lg">{current.title}</p>
          <p className="text-sm text-muted">{current.genres.join(" • ")}</p>
          <p className="text-xs text-muted mt-1">
            Card {Math.min(cardNumber, total)} of {total}
          </p>
        </div>
      )}

      <button
        onClick={undo}
        disabled={history.length === 0}
        className="mt-6 flex items-center gap-2 bg-primary-100 text-primary-600 font-medium rounded-full px-5 py-2.5 disabled:opacity-40"
      >
        <RotateCcw size={16} />
        Undo
      </button>

      {showWatchlist && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
          onClick={() => setShowWatchlist(false)}
        >
          <div
            className="bg-white w-full max-w-app rounded-t-4xl p-5 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-bold text-lg mb-4">Your Watchlist</p>
            {watchlist.length === 0 ? (
              <p className="text-sm text-muted">
                Swipe right on movies to add them here.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {watchlist.map((m) => (
                  <div key={m.id} className="relative aspect-[2/3] rounded-xl overflow-hidden">
                    <Image src={m.poster_url} alt={m.title} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowWatchlist(false)}
              className="w-full mt-5 rounded-full bg-primary-500 text-white font-semibold py-3"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
