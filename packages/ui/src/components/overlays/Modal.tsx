import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface ModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  title?: string;
  onCloseAction?: () => void;
  /** Width override, e.g. `sm:max-w-2xl`. Layout only — see conventions §5. */
  widthClass?: string;
}

export default function Modal({
  open,
  setOpen,
  title,
  children,
  onCloseAction,
  widthClass = "sm:max-w-md",
}: React.PropsWithChildren<ModalProps>) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) return setOpen(true);
        if (onCloseAction) onCloseAction();
        else setOpen(false);
      }}
    >
      <DialogContent className={widthClass}>
        <DialogHeader>
          {/* Radix requires a title for assistive tech even when none is shown. */}
          <DialogTitle className={title ? "text-xl" : "sr-only"}>
            {title ?? "Dialog"}
          </DialogTitle>
        </DialogHeader>

        <div>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
