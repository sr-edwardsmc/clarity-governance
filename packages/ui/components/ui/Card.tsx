import { ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function Card({
  children,
  className,
  hover = false,
  glow = false,
}: CardProps) {
  return (
    <div
      className={clsx(
        "glass rounded-xl p-6",
        hover &&
          "hover:scale-[1.02] transition-transform duration-200 cursor-pointer",
        glow && "glow-sm hover:glow",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={clsx("relative overflow-hidden", className)} glow>
      {/* Gradient background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/20 to-transparent rounded-full blur-3xl -z-10" />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-foreground-secondary text-sm font-medium mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-foreground mb-2">{value}</p>
          {trend && (
            <div className="flex items-center space-x-1">
              <span
                className={clsx(
                  "text-sm font-medium",
                  trend.isPositive ? "text-success" : "text-error"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-linear-to-br from-primary/20 to-secondary/20 border border-primary/30">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
