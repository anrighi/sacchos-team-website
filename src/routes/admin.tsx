import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { resetArchiveFn } from "#/lib/challenge/cloud";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "pending" }
    | { kind: "done"; deleted: number }
    | { kind: "error"; reason: string }
  >({ kind: "idle" });

  async function handleReset() {
    if (status.kind === "pending") return;
    setStatus({ kind: "pending" });
    try {
      const result = await resetArchiveFn();
      if (result.ok) {
        setStatus({ kind: "done", deleted: result.deleted });
      } else {
        setStatus({ kind: "error", reason: result.reason });
      }
    } catch {
      setStatus({ kind: "error", reason: "network" });
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 pt-16">
      <h1 className="mb-8 text-xl font-bold tracking-tight">Admin — reset archivio</h1>
      <button
        onClick={handleReset}
        disabled={status.kind === "pending"}
        className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-40"
      >
        {status.kind === "pending" ? "Cancellazione…" : "Reset archivio partite"}
      </button>

      {status.kind === "done" && (
        <p className="mt-6 text-sm text-green-400">
          ✓ Archivio svuotato — {status.deleted} chiavi eliminate.
        </p>
      )}
      {status.kind === "error" && (
        <p className="mt-6 text-sm text-red-400">
          {status.reason === "kv"
            ? "KV non disponibile (solo in produzione)."
            : "Errore di rete, riprova."}
        </p>
      )}
    </main>
  );
}
