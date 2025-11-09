"use client";

import Link from "next/link";
import { ArrowRight, Clock, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { VoteButton } from "../VoteButton";
import { Card } from "../ui";

interface ProposalCardProps {
  proposal: {
    id: bigint;
    description: string;
    state: number;
  };
}

const stateLabels = [
  "Pending",
  "Active",
  "Canceled",
  "Defeated",
  "Succeeded",
  "Queued",
  "Expired",
  "Executed",
];

export default function ProposalCard({ proposal }: ProposalCardProps) {
  const stateLabel = stateLabels[proposal.state] || "Unknown";

  const stateConfig: Record<
    string,
    { color: string; bg: string; border: string; icon: any }
  > = {
    Active: {
      color: "text-success",
      bg: "bg-success/10",
      border: "border-success/30",
      icon: Clock,
    },
    Succeeded: {
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/30",
      icon: CheckCircle2,
    },
    Executed: {
      color: "text-accent",
      bg: "bg-accent/10",
      border: "border-accent/30",
      icon: CheckCircle2,
    },
    Defeated: {
      color: "text-error",
      bg: "bg-error/10",
      border: "border-error/30",
      icon: XCircle,
    },
    Pending: {
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/30",
      icon: Hourglass,
    },
    Queued: {
      color: "text-secondary",
      bg: "bg-secondary/10",
      border: "border-secondary/30",
      icon: Clock,
    },
  };

  const config = stateConfig[stateLabel] || {
    color: "text-foreground-secondary",
    bg: "bg-background-tertiary",
    border: "border-border",
    icon: Clock,
  };

  const StateIcon = config.icon;

  return (
    <Card hover glow className="group">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-foreground-secondary text-sm font-mono">
              #{proposal.id.toString()}
            </span>
            <div
              className={`
                flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
                ${config.bg} ${config.color} ${config.border}
              `}
            >
              <StateIcon className="w-3.5 h-3.5" />
              {stateLabel}
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
            {proposal.description}
          </h3>
        </div>
      </div>

      {proposal.state === 1 && (
        <div className="space-y-3 mb-4 pt-4 border-t border-border/50">
          <p className="text-sm text-foreground-secondary font-medium">Cast your vote:</p>
          <div className="flex flex-wrap gap-3">
            <VoteButton proposalId={proposal.id} support={1} />
            <VoteButton proposalId={proposal.id} support={0} />
            <VoteButton proposalId={proposal.id} support={2} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-4 text-sm text-foreground-secondary">
          <span>Votes: 1,234</span>
          <span>•</span>
          <span>Quorum: 4%</span>
        </div>
        <Link
          href={`/proposals/${proposal.id}`}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </Card>
  );
}
