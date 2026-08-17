import { Check, CircleAlert, Info } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../ui/dialog";

import Button from "../Button";

interface NotificationModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  title?: string;
  onCloseAction?: () => void;
  type?: "success" | "error" | "info";
  actionButtonText?: string;
}

export default function NotificationModal({
  open,
  setOpen,
  title,
  children,
  onCloseAction,
  type,
  actionButtonText,
}: React.PropsWithChildren<NotificationModalProps>) {
  const handleClose = () => {
    if (onCloseAction) {
      onCloseAction();
    }
    setOpen(false);
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <Check className="h-6 w-6 text-green-600" aria-hidden="true" />;
      case "error":
        return (
          <CircleAlert className="h-6 w-6 text-red-600" aria-hidden="true" />
        );
      case "info":
      default:
        return <Info className="h-6 w-6 text-blue-600" aria-hidden="true" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100";
      case "error":
        return "bg-red-100";
      case "info":
      default:
        return "bg-blue-100";
    }
  };

  return (
    <Dialog open={open}>
      {/*
       * Dismissible only through the action button: the caller often navigates
       * away in onCloseAction, so a stray backdrop click must not skip it.
       * `[&>button]:hidden` drops the default corner close for the same reason.
       */}
      <DialogContent
        className="text-left sm:max-w-sm [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div>
          <div
            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${getBackgroundColor()}`}
          >
            {getIcon()}
          </div>
          <div className="mt-3 text-center sm:mt-5">
            <DialogTitle className="text-xl font-semibold leading-6 text-gray-900">
              {title}
            </DialogTitle>

            <div className="mt-2">
              <p className="text-sm text-gray-500">{children}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-6">
          <Button
            className="h-[38px] w-full"
            onClick={handleClose}
            text={actionButtonText || "Close"}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
