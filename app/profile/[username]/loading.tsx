export default function ProfileLoading() {
  return (
    <div className="min-h-dvh bg-white pb-24 px-4 pt-5 animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-primary-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-primary-100 rounded" />
          <div className="h-4 w-48 bg-primary-50 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square bg-primary-50" />
        ))}
      </div>
    </div>
  );
}
