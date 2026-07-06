import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_PROFILES } from "@/lib/mock-data";
import { ChatWindow } from "@/components/ChatWindow";
import type { Message, Profile } from "@/lib/types";

async function getConversation(id: string) {
  const supabase = await createClient();

  if (!supabase) {
    const convo = MOCK_CONVERSATIONS.find((c) => c.id === id);
    if (!convo) return null;
    return {
      currentUserId: MOCK_PROFILES[0].id,
      otherParticipant: convo.participants[0],
      messages: MOCK_MESSAGES[id] ?? (convo.last_message ? [convo.last_message] : []),
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: participants } = await supabase
    .from("conversation_participants")
    .select("user_id, users(id, username, display_name, avatar_url)")
    .eq("conversation_id", id);

  const other = participants?.find((p) => p.user_id !== user?.id);
  if (!other) return null;

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  return {
    currentUserId: user?.id ?? null,
    otherParticipant: other.users as unknown as Pick<
      Profile,
      "id" | "username" | "display_name" | "avatar_url"
    >,
    messages: (messages as Message[]) ?? [],
  };
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getConversation(id);
  if (!data) notFound();

  return (
    <ChatWindow
      conversationId={id}
      currentUserId={data.currentUserId}
      otherParticipant={data.otherParticipant}
      initialMessages={data.messages}
    />
  );
}
