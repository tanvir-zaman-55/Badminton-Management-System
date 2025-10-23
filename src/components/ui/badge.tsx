import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border border-primary/20",
        secondary:
          "bg-secondary/10 text-secondary border border-secondary/20",
        accent:
          "bg-accent/10 text-accent border border-accent/20",
        success:
          "bg-success/10 text-success border border-success/20",
        warning:
          "bg-warning/10 text-warning border border-warning/20",
        professional:
          "bg-bronze/10 text-bronze-700 border border-bronze/20",
        tech:
          "bg-cyber/10 text-cyber-700 border border-cyber/20",
        warm:
          "bg-amber/10 text-amber-700 border border-amber/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
