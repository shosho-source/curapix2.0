import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MOCK_PROFILES } from "@/lib/mock-data";

export default async function ProfileIndexPage() {
  const supabase = createClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profile?.username) redirect(`/profile/${profile.username}`);
    }
  }

  redirect(`/profile/${MOCK_PROFILES[0].username}`);
}
