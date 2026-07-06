import Link from "next/link";
import { Clapperboard, Compass, Users, Smartphone } from "lucide-react";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

const FEATURES = [
  {
    icon: Clapperboard,
    title: "Share your taste",
    description: "Rate, review and share your favorite movies.",
  },
  {
    icon: Compass,
    title: "Discover more",
    description: "Find new movies and hidden gems, just for you.",
  },
  {
    icon: Users,
    title: "Connect & discuss",
    description: "Join the conversation and connect with other movie lovers.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-lilac flex flex-col px-6 pt-16 pb-10 relative overflow-hidden">
      <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full bg-primary-200/60" />

      <div className="relative text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary-500">
          CuraPix
        </h1>
        <p className="mt-3 text-primary-500/80 text-lg leading-snug">
          Your space
          <br />
          for your taste
        </p>
      </div>

      <div className="relative mt-10 space-y-3">
        <GoogleLoginButton />
        <div className="flex items-center gap-3 text-muted text-sm">
          <div className="h-px bg-primary-200 flex-1" />
          or
          <div className="h-px bg-primary-200 flex-1" />
        </div>
        <Link
          href="/signup"
          className="w-full flex items-center justify-center rounded-full border-2 border-primary-500 text-primary-600 font-semibold py-3"
        >
          Sign up
        </Link>
      </div>

      <div className="relative mt-8 space-y-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex items-center gap-4 bg-white rounded-2xl px-4 py-4 shadow-card"
          >
            <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <Icon size={20} className="text-primary-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ink">{title}</p>
              <p className="text-sm text-muted">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-6 bg-primary-500 rounded-4xl p-5 text-white flex items-center gap-4 overflow-hidden">
        <div className="flex-1">
          <p className="font-semibold mb-1">Add to homescreen</p>
          <p className="text-sm text-white/80 mb-3">
            Get quick access by adding CuraPix to your homescreen.
          </p>
          <button className="flex items-center gap-2 bg-white text-primary-600 text-sm font-semibold rounded-full px-4 py-2">
            <Smartphone size={16} />
            Add to homescreen
          </button>
        </div>
      </div>

      <p className="relative mt-8 text-center text-xs text-muted space-x-4">
        <a href="#" className="hover:underline">Developer</a>
        <a href="#" className="hover:underline">Terms</a>
        <a href="#" className="hover:underline">Privacy</a>
      </p>
    </main>
  );
}
