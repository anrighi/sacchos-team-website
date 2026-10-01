import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { resetArchiveFn } from "#/lib/challenge/cloud";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "pending" }
    | { kind: "done"; deleted: number }
    | { kind: "error"; reason: string }
  >({ kind: "idle" });

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (status.kind === "pending") return;
    setStatus({ kind: "pending" });
    try {
      const result = await resetArchiveFn({ data: { secret } });
      if (result.ok) {
        setStatus({ kind: "done", deleted: result.deleted });
        setSecret("");
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
      <form onSubmit={handleReset} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-white/70">
          Password
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
            autoComplete="current-password"
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
          />
        </label>
        <button
          type="submit"
          disabled={status.kind === "pending" || !secret}
          className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-40"
        >
          {status.kind === "pending" ? "Cancellazione…" : "Reset archivio partite"}
        </button>
      </form>

      {status.kind === "done" && (
        <p className="mt-6 text-sm text-green-400">
          ✓ Archivio svuotato — {status.deleted} chiavi eliminate.
        </p>
      )}
      {status.kind === "error" && (
        <p className="mt-6 text-sm text-red-400">
          {status.reason === "unauthorized"
            ? "Password errata."
            : status.reason === "kv"
              ? "KV non disponibile (solo in produzione)."
              : "Errore di rete, riprova."}
        </p>
      )}
    </main>
  );
}
