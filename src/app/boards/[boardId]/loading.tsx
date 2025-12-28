export default function BoardLoading() {
  return (
    <main className="min-h-screen p-6">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-zinc-700 rounded mb-4" />
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-72 h-64 bg-zinc-800 rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}
