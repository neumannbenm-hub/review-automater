"use client";

import { useTransition } from "react";
import { deleteCampaignAction } from "@/app/actions/campaigns";

export function DeleteCampaignButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm("Delete this campaign?")) return;
        startTransition(() => deleteCampaignAction(id));
      }}
      disabled={isPending}
      className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 flex-shrink-0"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
