import { Skeleton } from "@gridcore/ui/components/ui/skeleton";

/** Content loading is a shimmer, never a spinner. */
export default function SectionLoader({ height = 200 }: { height?: string | number }) {
  const minHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      style={{ minHeight }}
      className="flex w-full flex-col justify-center gap-3 py-4"
      role="status"
      aria-label="Loading"
    >
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
