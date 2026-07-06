import { createClient } from "@/lib/supabase/server";
import { MOCK_CONVERSATIONS, MOCK_PROFILES } from "@/lib/mock-data";
import { BottomNav } from "@/components/BottomNav";
import { ConversationList } from "@/components/ConversationList";
import type { Conversation, Profile } from "@/lib/types";

async function getConversations(): Promise<{ me: Profile; conversations: Conversation[] }> {
  const supabase = await createClient();
  if (!supabase) {
    return { me: MOCK_PROFILES[0], conversations: MOCK_CONVERSATIONS };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { me: MOCK_PROFILES[0], conversations: MOCK_CONVERSATIONS };
  }

  const { data: me } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: rows } = await supabase
    .from("conversation_participants")
    .select(
      "conversation:conversations(id, is_group, title, updated_at), conversation_id"
    )
    .eq("user_id", user.id);

  const conversations: Conversation[] = [];

  for (const row of rows ?? []) {
    const convoId = row.conversation_id as string;

    const { data: others } = await supabase
      .from("conversation_participants")
      .select("users(id, username, display_name, avatar_url)")
      .eq("conversation_id", convoId)
      .neq("user_id", user.id);

    const { data: lastMessage } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { count: unreadCount } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", convoId)
      .is("read_at", null)
      .neq("sender_id", user.id);

    conversations.push({
      id: convoId,
      is_group: false,
      title: null,
      updated_at: lastMessage?.created_at ?? new Date().toISOString(),
      participants: (others ?? []).map((o) => o.users) as unknown as Conversation["participants"],
      last_message: lastMessage ?? null,
      unread_count: unreadCount ?? 0,
    });
  }

  conversations.sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return { me: (me as Profile) ?? MOCK_PROFILES[0], conversations };
}

export default async function MessagesPage() {
  const { me, conversations } = await getConversations();

  return (
    <div className="min-h-dvh bg-white pb-24">
      <header className="px-4 pt-5 pb-3 flex items-center gap-1 text-muted text-sm font-medium">
        {me.username}
        <span className="text-xs">▾</span>
      </header>

      <main className="px-4">
        <h1 className="text-3xl font-extrabold mb-4">Messages</h1>
        <ConversationList me={me} conversations={conversations} />
      </main>

      <BottomNav avatarUrl={me.avatar_url} username={me.username} />
    </div>
  );
}
