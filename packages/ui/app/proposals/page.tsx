"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Plus, Filter, Search } from "lucide-react";
import { ProposalCard } from "@/components/ProposalCard";
import { Button } from "@/components/ui";

export default function ProposalsPage() {
  const { isConnected } = useAccount();
  const [proposals] = useState([
    {
      id: BigInt(1),
      description: "Increase treasury allocation for development",
      state: 1,
    },
    {
      id: BigInt(2),
      description: "Update governance parameters and voting thresholds",
      state: 4,
    },
    {
      id: BigInt(3),
      description: "Implement new tokenomics distribution model",
      state: 1,
    },
    {
      id: BigInt(4),
      description: "Upgrade smart contract infrastructure",
      state: 0,
    },
  ]);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                Governance <span className="gradient-text">Proposals</span>
              </h1>
              <p className="text-foreground-secondary text-lg">
                Review and vote on proposals to shape the protocol's future
              </p>
            </div>

            {isConnected && (
              <Link href="/proposals/create">
                <Button
                  variant="primary"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Proposal
                </Button>
              </Link>
            )}
          </div>

          {/* Search and Filter */}
          {isConnected && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-secondary" />
                <input
                  type="text"
                  placeholder="Search proposals..."
                  className="w-full pl-10 pr-4 py-3 bg-background-tertiary border border-border rounded-lg text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <Button variant="secondary" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        {isConnected ? (
          <div className="space-y-6">
            {proposals.length > 0 ? (
              proposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id.toString()}
                  proposal={proposal}
                />
              ))
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex p-6 rounded-full bg-background-tertiary border border-border mb-4">
                  <Plus className="w-12 h-12 text-foreground-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No proposals yet</h3>
                <p className="text-foreground-secondary mb-6">
                  Be the first to create a proposal and start the conversation
                </p>
                <Link href="/proposals/create">
                  <Button variant="primary">Create First Proposal</Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="inline-flex p-6 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 border border-primary/30 mb-6">
                <Plus className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-foreground-secondary text-lg mb-8">
                Connect your wallet to view and participate in governance
                proposals
              </p>
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
