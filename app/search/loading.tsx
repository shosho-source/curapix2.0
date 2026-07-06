export default function SearchLoading() {
  return (
    <div className="min-h-dvh bg-white pb-24 px-4 pt-5 animate-pulse">
      <div className="h-6 w-24 bg-primary-100 rounded-full mb-6" />
      <div className="h-8 w-56 bg-primary-100 rounded-full mx-auto mb-6" />
      <div className="h-12 bg-primary-50 rounded-full mb-4" />
      <div className="h-44 bg-primary-50 rounded-2xl mb-6" />
      <div className="flex gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-28 h-40 bg-primary-50 rounded-xl shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] bg-primary-50 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
