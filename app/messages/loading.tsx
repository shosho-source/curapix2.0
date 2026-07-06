export default function MessagesLoading() {
  return (
    <div className="min-h-dvh bg-white pb-24 px-4 pt-5 animate-pulse">
      <div className="h-8 w-40 bg-primary-100 rounded mb-4" />
      <div className="h-12 bg-primary-50 rounded-full mb-5" />
      <div className="flex gap-4 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-14 h-14 rounded-full bg-primary-50 shrink-0" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-primary-50 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
