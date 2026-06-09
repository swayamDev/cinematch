export default function MovieCardSkeleton() {
  return (
    <div className="movie-card overflow-hidden">
      <div className="skeleton aspect-[2/3] w-full" />
      <div className="p-4 flex flex-col gap-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-4/5" />
        <div className="mt-2 skeleton h-2 w-full rounded-full" />
      </div>
    </div>
  );
}
