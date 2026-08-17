import { Skeleton } from "@gridcore/ui/components/ui/skeleton";

interface SectionLoaderProps {
  height?: string | number;
  /** Kept so legacy call sites compile; the shimmer ignores them. */
  color?: string;
  size?: number;
}

/** Content loading is a shimmer, never a spinner. */
const SectionLoader: React.FC<SectionLoaderProps> = ({ height = 200 }) => {
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
};

export default SectionLoader;
