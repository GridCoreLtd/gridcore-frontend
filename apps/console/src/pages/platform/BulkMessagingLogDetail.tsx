import { useParams } from "react-router-dom";

import { MessageDetailView } from "@/features/bulk-messaging";

export default function MessageLogDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <MessageDetailView id={id ?? ""} />;
}
