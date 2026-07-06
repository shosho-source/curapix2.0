"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "post-images";
const MAX_IMAGES = 4;

export function NewPostModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, MAX_IMAGES);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  function removeImage(index: number) {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit() {
    setError(null);

    const supabase = createClient();
    if (!supabase) {
      setError(
        "Supabase isn't configured yet. Add your project URL and anon key to enable posting."
      );
      return;
    }
    if (files.length === 0) {
      setError("Add at least one image.");
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You need to be logged in to post.");
        setSubmitting(false);
        return;
      }

      // Upload each image to Storage under a per-user folder, then collect
      // the public URLs so the RLS insert policy (folder name === auth.uid())
      // is satisfied.
      const imageUrls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(path);

        imageUrls.push(publicUrl.publicUrl);
      }

      const { error: insertError } = await supabase.from("posts").insert({
        user_id: user.id,
        image_urls: imageUrls,
        caption: caption.trim() || null,
      });

      if (insertError) throw insertError;

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-app rounded-t-4xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-lg">New post</p>
          <button onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="grid grid-cols-3 gap-2 mb-3">
          {previews.map((src, i) => (
            <div key={src} className="relative aspect-square rounded-xl overflow-hidden">
              <Image src={src} alt="" fill className="object-cover" unoptimized />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                aria-label="Remove image"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          ))}
          {previews.length < MAX_IMAGES && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-primary-200 flex flex-col items-center justify-center gap-1 text-primary-400"
            >
              <ImagePlus size={22} />
              <span className="text-xs">Add</span>
            </button>
          )}
        </div>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          rows={3}
          className="w-full bg-primary-50 rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted mb-3 resize-none"
        />

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-primary-500 text-white font-semibold py-3 disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Posting..." : "Share post"}
        </button>
      </div>
    </div>
  );
}
