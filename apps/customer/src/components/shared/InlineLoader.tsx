import classNames from "classnames";

interface LoaderProps {
  message?: string;
  size?: number;
  className?: string;
}

const InlineLoader = ({ message, size = 7, className }: LoaderProps) => {
  const sizeClass = `h-${size} w-${size}`;

  return (
    <div>
      <img
        src="/icons/loading-black.png"
        alt="Spinnner"
        className={classNames("animate-spin ml-5", sizeClass, className)}
      />

      {message && (
        <div className="text-center text-white text-xl font-medium mt-6">
          {message}
        </div>
      )}
    </div>
  );
};

export default InlineLoader;
