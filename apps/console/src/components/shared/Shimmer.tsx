
import type React from "react";

import classNames from "classnames";

interface ShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string; // Tailwind radius class, e.g., "rounded-md", "rounded-full"
}

const Shimmer: React.FC<ShimmerProps> = ({
  className,
  width = "100%",
  height = "1rem",
  rounded = "rounded-md",
}) => {
  return (
    <div
      className={classNames(
        "animate-pulse bg-gray-200",
        rounded,
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
};

export default Shimmer;
