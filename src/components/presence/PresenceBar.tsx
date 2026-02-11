"use client";

type PresenceUser = {
  id: string;
  name: string;
  updatedAt: number;
};

type Props = {
  users: PresenceUser[];
};

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export function PresenceBar({ users }: Props) {
  const shown = users.slice(0, 5);

  return (
    <div className="flex items-center gap-2 text-xs text-zinc-300">
      <span className="text-zinc-400">Live:</span>
      <div className="flex items-center -space-x-2">
        {shown.map((user) => (
          <span
            key={user.id}
            title={user.name}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-600 bg-zinc-700 text-[10px] font-semibold"
          >
            {initials(user.name) || "U"}
          </span>
        ))}
      </div>
      <span className="text-zinc-400">{users.length} online</span>
    </div>
  );
}
