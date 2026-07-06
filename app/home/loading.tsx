export default function HomeLoading() {
  return (
    <div className="min-h-dvh bg-white pb-24 px-4 pt-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-24 bg-primary-100 rounded-full" />
        <div className="h-9 w-28 bg-primary-100 rounded-full" />
      </div>
      <div className="h-10 bg-primary-50 rounded-full mb-4" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-primary-50 h-56" />
        ))}
      </div>
    </div>
  );
}
