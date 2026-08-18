import { useNavigate, useSearchParams } from "react-router-dom";

import { ComposeTab, LogsTab } from "@/features/bulk-messaging";

/**
 * Bulk messaging on the v2 contract (blueprint 50): platform-only, SMS or
 * email, per-recipient delivery logs. The two tabs survive the port.
 */
export default function BulkMessaging() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = params.get("tab") === "logs" ? "logs" : "compose";

  return (
    <section className="flex flex-col gap-5">
      <p className="-mt-4 text-sm text-muted-foreground">
        Send an SMS or email campaign to customers and merchants, with a per-recipient
        delivery log.
      </p>

      <div className="flex gap-1 self-start rounded-lg bg-primary/5 p-1">
        <button
          type="button"
          onClick={() => setParams({})}
          className={
            tab === "compose"
              ? "rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
              : "rounded-md px-3 py-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          }
        >
          Send message
        </button>
        <button
          type="button"
          onClick={() => setParams({ tab: "logs" })}
          className={
            tab === "logs"
              ? "rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
              : "rounded-md px-3 py-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          }
        >
          Message logs
        </button>
      </div>

      {tab === "compose" ? (
        <ComposeTab onSent={(id) => navigate(`/bulk-messaging/logs/${id}`)} />
      ) : (
        <LogsTab />
      )}
    </section>
  );
}
