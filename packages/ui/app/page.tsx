"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { Vote, Users, TrendingUp, Shield, Zap, ArrowRight } from "lucide-react";

import { useVotingPower } from "@/hooks/useVotingPower";
import { StatsCard, Card, Button } from "@/components/ui";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { votingPower, isLoading } = useVotingPower(address);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-[128px] animate-pulse delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Transparent <span className="gradient-text">On-Chain</span>{" "}
              Governance
            </h1>
            <p className="text-xl text-foreground-secondary mb-8">
              Participate in decentralized decision-making. Vote on proposals,
              delegate your power, and shape the future of the protocol.
            </p>

            {!isConnected && (
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            )}
          </div>

          {isConnected && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatsCard
                  label="Your Voting Power"
                  value={isLoading ? "..." : votingPower?.toString() || "0"}
                  icon={<Vote className="w-6 h-6 text-primary" />}
                />
                <StatsCard
                  label="Active Proposals"
                  value="12"
                  icon={<TrendingUp className="w-6 h-6 text-secondary" />}
                  trend={{ value: "3 new", isPositive: true }}
                />
                <StatsCard
                  label="Total Participants"
                  value="1,247"
                  icon={<Users className="w-6 h-6 text-accent" />}
                  trend={{ value: "12%", isPositive: true }}
                />
              </div>

              {/* Action Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <Link href="/proposals" className="group">
                  <Card hover glow className="h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20 border border-primary/30">
                        <Vote className="w-8 h-8 text-primary" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-foreground-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">
                      View Proposals
                    </h3>
                    <p className="text-foreground-secondary mb-4">
                      Browse and vote on active governance proposals. Your voice
                      matters in shaping protocol decisions.
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-primary font-medium">
                      <span>Explore Proposals</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Card>
                </Link>

                <Link href="/delegate" className="group">
                  <Card hover glow className="h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-linear-to-br from-accent/20 to-secondary/20 border border-accent/30">
                        <Users className="w-8 h-8 text-accent" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-foreground-secondary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">
                      Delegate Votes
                    </h3>
                    <p className="text-foreground-secondary mb-4">
                      Delegate your voting power to a trusted representative or
                      vote directly on proposals yourself.
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-accent font-medium">
                      <span>Manage Delegation</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Card>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-background-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why <span className="gradient-text">Clarity Governance</span>?
            </h2>
            <p className="text-xl text-foreground-secondary">
              Built on transparent, secure, and battle-tested smart contracts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 mb-4">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure & Audited</h3>
              <p className="text-foreground-secondary">
                Built with OpenZeppelin's battle-tested governance contracts for
                maximum security
              </p>
            </Card>

            <Card className="text-center">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 border border-secondary/30 mb-4">
                <Zap className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fully On-Chain</h3>
              <p className="text-foreground-secondary">
                All proposals and votes are recorded on-chain, ensuring complete
                transparency
              </p>
            </Card>

            <Card className="text-center">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30 mb-4">
                <Users className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community Driven</h3>
              <p className="text-foreground-secondary">
                Every token holder has a voice in the governance process through
                voting or delegation
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
