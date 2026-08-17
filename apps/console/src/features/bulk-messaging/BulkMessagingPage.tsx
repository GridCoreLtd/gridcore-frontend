
import classNames from "classnames";
import { FileText, Send } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { MessageLogsTab } from "./components/MessageLogsTab";
import { SendMessageTab } from "./components/SendMessageTab";


const TABS = [
  { id: "send", label: "Send Message", icon: Send },
  { id: "logs", label: "Message Logs", icon: FileText },
] as const;

export function BulkMessagingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "logs" ? "logs" : "send";

  const setTab = (id: "send" | "logs") => {
    if (id === "logs") navigate("/bulk-messaging?tab=logs");
    else navigate("/bulk-messaging");
  };

  return (
    <main className="container max-w-full">
      <h1 className="text-2xl font-medium text-gray-900 mb-1">Bulk Messaging</h1>
      <p className="text-sm text-accent mb-6">Send messages to merchants and customers</p>

      <div className="border-b border-gray-200 mb-8">
        <nav className="flex gap-6" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTab(tab.id)}
                className={classNames(
                  "flex items-center gap-2 pb-4 pt-1 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "text-gray-900 border-secondary bg-transparent"
                    : "text-accent hover:text-gray-600 hover:border-gray-300"
                )}
                style={
                  isActive
                    ? { borderBottomColor: "#E0E04C" }
                    : undefined
                }
              >
                <Icon className={classNames("h-5 w-5", isActive ? "text-gray-900" : "text-accent")} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "send" && <SendMessageTab />}
      {activeTab === "logs" && <MessageLogsTab />}
    </main>
  );
}
