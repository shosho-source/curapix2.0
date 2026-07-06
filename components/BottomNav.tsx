"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Globe, Search, Send } from "lucide-react";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/explore", icon: Globe, label: "Explore" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/messages", icon: Send, label: "Messages" },
];

export function BottomNav({
  avatarUrl,
  username,
}: {
  avatarUrl?: string | null;
  username?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white/95 backdrop-blur border-t border-primary-100 shadow-nav z-40">
      <div className="flex items-center justify-between px-6 py-3">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex items-center justify-center rounded-full transition-all ${
                active ? "bg-primary-500 px-4 py-2" : "px-3 py-2"
              }`}
            >
              <Icon
                size={22}
                strokeWidth={2}
                className={active ? "text-white" : "text-ink"}
              />
            </Link>
          );
        })}
        <Link
          href={username ? `/profile/${username}` : "/profile"}
          aria-label="Profile"
          className={`flex items-center justify-center rounded-full overflow-hidden w-9 h-9 relative ring-2 ${
            pathname.startsWith("/profile")
              ? "ring-primary-500"
              : "ring-transparent"
          }`}
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt={username ?? "Profile"} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-primary-200" />
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white" />
        </Link>
      </div>
    </nav>
  );
}
