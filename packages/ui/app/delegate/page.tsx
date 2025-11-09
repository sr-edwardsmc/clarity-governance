"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Vote, TrendingUp, Users, Info } from "lucide-react";
import { DelegateForm } from "@/components/DelegateForm";
import { useVotingPower } from "@/hooks/useVotingPower";
import { StatsCard, Card } from "@/components/ui";

export default function DelegatePage() {
  const { address, isConnected } = useAccount();
  const { votingPower, isLoading } = useVotingPower(address);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            Vote <span className="gradient-text">Delegation</span>
          </h1>
          <p className="text-foreground-secondary text-lg">
            Manage your voting power and delegate to representatives
          </p>
        </div>

        {isConnected ? (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                label="Your Voting Power"
                value={isLoading ? "..." : votingPower?.toString() || "0"}
                icon={<Vote className="w-6 h-6 text-primary" />}
              />
              <StatsCard
                label="Delegation Status"
                value="Active"
                icon={<TrendingUp className="w-6 h-6 text-success" />}
              />
              <StatsCard
                label="Total Delegators"
                value="847"
                icon={<Users className="w-6 h-6 text-accent" />}
              />
            </div>

            {/* How it Works */}
            <Card>
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30">
                  <Info className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    How Delegation Works
                  </h3>
                  <p className="text-foreground-secondary">
                    Understand the delegation process and its benefits
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Activate Voting Power
                      </h4>
                      <p className="text-sm text-foreground-secondary">
                        Delegate to yourself to activate your voting power and
                        participate directly
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Choose a Representative
                      </h4>
                      <p className="text-sm text-foreground-secondary">
                        Or delegate to a trusted community member to vote on
                        your behalf
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Maintain Control
                      </h4>
                      <p className="text-sm text-foreground-secondary">
                        You can change your delegation or vote directly at any
                        time
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Participate in Governance
                      </h4>
                      <p className="text-sm text-foreground-secondary">
                        Help shape the future of the protocol through active
                        participation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Delegation Form */}
            <DelegateForm />
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 mb-6">
                <Users className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-foreground-secondary text-lg mb-8">
                Connect your wallet to manage your voting delegation
              </p>
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
