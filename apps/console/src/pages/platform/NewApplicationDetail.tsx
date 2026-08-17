import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Globe, MapPin, Phone, Mail, User, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { parseApiError, toastMessage } from "@gridcore/api-client";
import Modal from "@gridcore/ui/components/overlays/Modal";
import { Badge } from "@gridcore/ui/components/ui/badge";
import { Button } from "@gridcore/ui/components/ui/button";

import SectionLoader from "@/components/shared/SectionLoader";
import {
  ApplicationDocuments,
  decideApplication,
  listApplications,
  type Application,
} from "@/features/applications";
import { dateFormatter } from "@/utils/formatters";

type Decision = "approve" | "reject";

/** What each decision actually does, said plainly before it is taken. */
const consequences: Record<Decision, { title: string; body: string; cta: string }> = {
  approve: {
    title: "Approve this application?",
    body: "This creates the merchant and their admin account, and texts the applicant a one-time link to set a password. It cannot be undone.",
    cta: "Approve and send the link",
  },
  reject: {
    title: "Reject this application?",
    body: "The applicant is told by SMS that they were not approved. It cannot be undone, and they would have to apply again.",
    cta: "Reject the application",
  },
};

export default function NewApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState<Decision>();

  // The queue is the read model; there is no by-id endpoint and this list is
  // capped at 200, so filtering it costs nothing a second request would not.
  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications", "all"],
    queryFn: () => listApplications(),
  });

  const application = applications?.find((a) => a.id === id);

  const decide = useMutation({
    mutationFn: (decision: Decision) => decideApplication(id ?? "", decision),
    onSuccess: (res) => {
      setConfirming(undefined);
      toast.success(
        res.state === "APPROVED"
          ? "Approved — the applicant has been sent their sign-in link."
          : "Rejected — the applicant has been told."
      );
      void queryClient.invalidateQueries({ queryKey: ["applications"] });
      void navigate("/merchants/new-applications");
    },
    onError: (err) => toast.error(toastMessage(parseApiError(err))),
  });

  if (isLoading) return <SectionLoader />;

  if (!application) {
    return (
      <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        No such application. It may have been decided already.
      </p>
    );
  }

  const pending = application.state === "APPLIED";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {application.name}
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {application.shortBusinessName}.gridcore.test.net
          </p>
          <span aria-hidden className="mt-2 block h-1 w-10 rounded-full bg-secondary" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={pending ? "secondary" : "muted"}>{application.state}</Badge>
          <p className="text-xs text-muted-foreground">
            Submitted {dateFormatter.format(new Date(application.submittedAt))}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <Panel title="The business">
            <Row icon={Globe} label="Country">
              {application.country}
            </Row>
            <Row icon={MapPin} label="Address">
              {application.address}
            </Row>
          </Panel>

          <Panel title="The person who will administer it">
            <Row icon={User} label="Name">
              {application.applicantName}
            </Row>
            <Row icon={Phone} label="Phone">
              {application.applicantPhone}
            </Row>
            <Row icon={Mail} label="Email">
              {application.applicantEmail}
            </Row>
          </Panel>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <ApplicationDocuments application={application} />
          {pending && (
            <Decide
              application={application}
              busy={decide.isLoading}
              onChoose={setConfirming}
            />
          )}
        </div>
      </div>

      {confirming && (
        <Modal
          open
          setOpen={() => setConfirming(undefined)}
          title={consequences[confirming].title}
        >
          <p className="text-sm text-muted-foreground">
            {consequences[confirming].body}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={decide.isLoading}
              onClick={() => setConfirming(undefined)}
            >
              Cancel
            </Button>
            <Button
              variant={confirming === "reject" ? "destructive" : "default"}
              disabled={decide.isLoading}
              onClick={() => decide.mutate(confirming)}
            >
              {consequences[confirming].cta}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Decide({
  application,
  busy,
  onChoose,
}: {
  application: Application;
  busy: boolean;
  onChoose: (decision: Decision) => void;
}) {
  const missing = 2 - (application.documents?.length ?? 0);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
        Decision
      </h2>

      {missing > 0 && (
        <p className="rounded-md bg-warning/20 px-3 py-2 text-sm text-foreground">
          {missing === 2
            ? "Neither document is attached."
            : "One document is missing."}{" "}
          This application predates the rule requiring all three, so approving it
          means deciding without the evidence.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button disabled={busy} onClick={() => onChoose("approve")}>
          <Check className="size-4" aria-hidden />
          Approve
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => onChoose("reject")}>
          <X className="size-4" aria-hidden />
          Reject
        </Button>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
        {title}
      </h2>
      <dl className="flex flex-col gap-4">{children}</dl>
    </section>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Globe;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden
        className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {label}
        </dt>
        <dd className="wrap-break-word text-foreground">{children}</dd>
      </div>
    </div>
  );
}
