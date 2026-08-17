import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../ui/dialog";

interface LoaderProps {
  setOpen: (value: boolean) => void;
  message?: string;
}

const Loader = ({ setOpen, message }: LoaderProps) => {
  return (
    <Dialog open onOpenChange={setOpen}>
      {/* A spinner, not a panel: no chrome, no shadow, no close button. */}
      <DialogContent className="border-0 bg-transparent p-0 shadow-none [&>button]:hidden">
        <DialogTitle className="sr-only">{message ?? "Loading"}</DialogTitle>

        <img
          src="/icons/loading.png"
          alt=""
          className="mx-auto h-10 w-10 animate-spin"
        />

        <div className="mt-6 text-center text-xl font-medium text-white">
          {message}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Loader;
