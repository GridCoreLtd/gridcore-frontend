import { Suspense } from "react";

import { BulkMessagingPage } from "@/features/bulk-messaging";

export default function BulkMessagingRoute() {
  return (
    <Suspense fallback={<div className="container max-w-full py-8 text-gray-500">Loading...</div>}>
      <BulkMessagingPage />
    </Suspense>
  );
}
