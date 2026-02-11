"use client";

import type { ConnectionState } from "@/lib/hooks/use-socket";

type Props = {
  state: ConnectionState;
};

const statusStyles: Record<ConnectionState, string> = {
  connected: "text-emerald-300 border-emerald-500/60",
  reconnecting: "text-amber-300 border-amber-500/60",
  disconnected: "text-rose-300 border-rose-500/60",
};

const statusLabel: Record<ConnectionState, string> = {
  connected: "Connected",
  reconnecting: "Reconnecting...",
  disconnected: "Offline",
};

export function ConnectionStatus({ state }: Props) {
  return (
    <div className={`rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[state]}`}>
      {statusLabel[state]}
    </div>
  );
}
