"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Plus, AlertCircle, Vote } from "lucide-react";

import { useVotingPower } from "@/hooks/useVotingPower";
import { ProposalForm } from "@/components/ProposalForm";
import { Card } from "@/components/ui";
import { PROPOSAL_THRESHOLD } from "@/lib/constants";

export default function CreateProposalPage() {
  const { address, isConnected } = useAccount();
  const { votingPower } = useVotingPower(address);

  const hasEnoughTokens =
    votingPower &&
    typeof votingPower === "bigint" &&
    votingPower >= PROPOSAL_THRESHOLD;

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            Create <span className="gradient-text">Proposal</span>
          </h1>
          <p className="text-foreground-secondary text-lg">
            Submit a new proposal for community voting
          </p>
        </div>

        {!isConnected ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="inline-flex p-6 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 border border-primary/30 mb-6">
                <Plus className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-foreground-secondary text-lg mb-8">
                Connect your wallet to create and submit proposals
              </p>
              <ConnectButton />
            </div>
          </div>
        ) : !hasEnoughTokens ? (
          <Card className="border-warning/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  Insufficient Voting Power
                </h3>
                <p className="text-foreground-secondary mb-3">
                  You need at least 1,000 GOV tokens to create proposals.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Vote className="w-4 h-4 text-foreground-secondary" />
                  <span className="text-foreground-secondary">
                    Your current voting power:{" "}
                    <span className="font-bold text-foreground">
                      {votingPower?.toString() || "0"} GOV
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <ProposalForm />
        )}
      </div>
    </div>
  );
}
