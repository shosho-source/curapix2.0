"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Message, Profile } from "@/lib/types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatWindow({
  conversationId,
  currentUserId,
  otherParticipant,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string | null;
  otherParticipant: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
  initialMessages: Message[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Live-updates the thread as new rows land in public.messages for this
  // conversation — covers messages sent by the other participant from
  // another device/tab without needing a page refresh.
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function handleSend() {
    const body = draft.trim();
    if (!body) return;

    const supabase = createClient();
    if (!supabase || !currentUserId) {
      // No backend configured: just reflect it locally so the UI stays usable.
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          conversation_id: conversationId,
          sender_id: currentUserId ?? "me",
          body,
          created_at: new Date().toISOString(),
          read_at: null,
        },
      ]);
      setDraft("");
      return;
    }

    setSending(true);
    setDraft("");

    // Optimistic append; the realtime subscription will dedupe when the
    // real row arrives (or replace this if the insert fails).
    const optimisticId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        conversation_id: conversationId,
        sender_id: currentUserId,
        body,
        created_at: new Date().toISOString(),
        read_at: null,
      },
    ]);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      body,
    });

    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setDraft(body);
    }
    setSending(false);
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-primary-50 shrink-0">
        <Link href="/messages" aria-label="Back">
          <ArrowLeft size={20} />
        </Link>
        <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
          {otherParticipant.avatar_url && (
            <Image
              src={otherParticipant.avatar_url}
              alt={otherParticipant.display_name}
              fill
              className="object-cover"
            />
          )}
        </div>
        <p className="font-semibold">{otherParticipant.display_name}</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  mine
                    ? "bg-primary-500 text-white rounded-br-md"
                    : "bg-primary-50 text-ink rounded-bl-md"
                }`}
              >
                <p>{m.body}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    mine ? "text-white/70" : "text-muted"
                  }`}
                >
                  {formatTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-primary-50 shrink-0">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Message..."
          className="flex-1 bg-primary-50 rounded-full px-4 py-2.5 text-sm outline-none placeholder:text-muted"
        />
        <button
          onClick={handleSend}
          disabled={sending || !draft.trim()}
          aria-label="Send"
          className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center disabled:opacity-40 shrink-0"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}
