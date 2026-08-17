import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

interface SlideOverProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  title?: string;
}

export default function SlideOver({
  open,
  setOpen,
  title,
  children,
}: React.PropsWithChildren<SlideOverProps>) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-screen max-w-md flex-col gap-0 overflow-y-auto p-0"
      >
        <SheetHeader className="border-b border-gray-200 bg-gray-100 py-6 px-4 sm:px-8">
          <SheetTitle className="text-xl font-semibold leading-6">
            {title}
          </SheetTitle>
        </SheetHeader>

        <div className="relative mt-6 flex-1 px-4 pb-6 sm:px-8">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
