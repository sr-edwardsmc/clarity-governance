"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { contracts } from "@/lib/contracts";
import { VoteButton } from "@/components/VoteButton";
import { useQueueProposal, useExecuteProposal } from "@/hooks/useGovernance";
import { toast } from "react-hot-toast";
import { Card, Button } from "@/components/ui";
import { PROPOSAL_STATE_LABELS } from "@/lib/constants";

export default function ProposalDetailPage() {
  const params = useParams();
  const proposalId = BigInt(params.id as string);
  const { isConnected } = useAccount();

  // Read proposal state
  const { data: state } = useReadContract({
    ...contracts.governor,
    functionName: "state",
    args: [proposalId],
  });

  const { data: votes } = useReadContract({
    ...contracts.governor,
    functionName: "proposalVotes",
    args: [proposalId],
  });

  const { data: snapshot } = useReadContract({
    ...contracts.governor,
    functionName: "proposalSnapshot",
    args: [proposalId],
  });

  const { data: deadline } = useReadContract({
    ...contracts.governor,
    functionName: "proposalDeadline",
    args: [proposalId],
  });

  const { queueProposal, isPending: isQueueing } = useQueueProposal();
  const { executeProposal, isPending: isExecuting } = useExecuteProposal();

  const handleQueue = () => {
    toast.error(
      "Queue functionality needs proposal data - implement based on your storage"
    );
  };

  const handleExecute = () => {
    toast.error(
      "Execute functionality needs proposal data - implement based on your storage"
    );
  };

  const stateLabel =
    state !== undefined ? PROPOSAL_STATE_LABELS[Number(state)] : "Loading...";

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
  };

  const config = stateConfig[stateLabel] || {
    color: "text-foreground-secondary",
    bg: "bg-background-tertiary",
    border: "border-border",
    icon: Clock,
  };

  const StateIcon = config.icon;

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/proposals"
          className="inline-flex items-center gap-2 text-foreground-secondary hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Proposals</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            Proposal{" "}
            <span className="gradient-text">#{proposalId.toString()}</span>
          </h1>
        </div>

        {!isConnected ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="inline-flex p-6 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 border border-primary/30 mb-6">
                <TrendingUp className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-foreground-secondary text-lg mb-8">
                Connect your wallet to view proposal details
              </p>
              <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status */}
            <Card glow>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-3 text-foreground">
                    Proposal: Set Value to 42
                  </h2>
                  <div
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border
                      ${config.bg} ${config.color} ${config.border}
                    `}
                  >
                    <StateIcon className="w-3.5 h-3.5" />
                    {stateLabel}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border/50">
                <div>
                  <p className="text-foreground-secondary text-sm mb-1">
                    Snapshot Block
                  </p>
                  <p className="font-bold text-foreground">
                    {snapshot?.toString() || "Loading..."}
                  </p>
                </div>
                <div>
                  <p className="text-foreground-secondary text-sm mb-1">
                    Deadline Block
                  </p>
                  <p className="font-bold text-foreground">
                    {deadline?.toString() || "Loading..."}
                  </p>
                </div>
              </div>
            </Card>

            {/* Voting Results */}
            <Card glow>
              <h3 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Voting Results
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-foreground font-medium">For</span>
                    <span className="font-bold text-success">
                      {votes && Array.isArray(votes) && votes[1]
                        ? votes[1].toString()
                        : "0"}
                    </span>
                  </div>
                  <div className="w-full bg-background-tertiary rounded-full h-3 overflow-hidden border border-border">
                    <div
                      className="bg-linear-to-r from-success to-success/80 h-3 rounded-full transition-all duration-500"
                      style={{ width: "60%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-foreground font-medium">Against</span>
                    <span className="font-bold text-error">
                      {votes && Array.isArray(votes) && votes[0]
                        ? votes[0].toString()
                        : "0"}
                    </span>
                  </div>
                  <div className="w-full bg-background-tertiary rounded-full h-3 overflow-hidden border border-border">
                    <div
                      className="bg-linear-to-r from-error to-error/80 h-3 rounded-full transition-all duration-500"
                      style={{ width: "20%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-foreground font-medium">Abstain</span>
                    <span className="font-bold text-foreground-secondary">
                      {votes && Array.isArray(votes) && votes[2]
                        ? votes[2].toString()
                        : "0"}
                    </span>
                  </div>
                  <div className="w-full bg-background-tertiary rounded-full h-3 overflow-hidden border border-border">
                    <div
                      className="bg-linear-to-r from-foreground-secondary to-foreground-secondary/80 h-3 rounded-full transition-all duration-500"
                      style={{ width: "20%" }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card glow>
              <h3 className="text-xl font-bold mb-4 text-foreground">
                Actions
              </h3>

              {/* Active - Can Vote */}
              {state === 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-foreground-secondary mb-4">
                    Cast your vote on this proposal:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <VoteButton proposalId={proposalId} support={1} />
                    <VoteButton proposalId={proposalId} support={0} />
                    <VoteButton proposalId={proposalId} support={2} />
                  </div>
                </div>
              )}

              {/* Succeeded - Can Queue */}
              {state === 4 && (
                <Button
                  onClick={handleQueue}
                  disabled={isQueueing}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isQueueing}
                >
                  {isQueueing ? "Queuing..." : "Queue Proposal"}
                </Button>
              )}

              {/* Queued - Can Execute */}
              {state === 5 && (
                <Button
                  onClick={handleExecute}
                  disabled={isExecuting}
                  variant="success"
                  size="lg"
                  className="w-full"
                  isLoading={isExecuting}
                >
                  {isExecuting ? "Executing..." : "Execute Proposal"}
                </Button>
              )}

              {/* Executed */}
              {state === 7 && (
                <div className="text-center py-6 bg-success/10 border border-success/30 rounded-lg">
                  <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                  <p className="text-success font-bold text-lg">
                    Proposal Executed Successfully
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
