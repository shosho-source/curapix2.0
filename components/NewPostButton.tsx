"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { NewPostModal } from "./NewPostModal";

export function NewPostButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="New post"
        className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center"
      >
        <Plus size={18} className="text-primary-600" />
      </button>
      {open && <NewPostModal onClose={() => setOpen(false)} />}
    </>
  );
}
