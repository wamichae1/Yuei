import type { HTMLAttributes, ReactNode } from "react";

interface LiquidCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * A lightweight adaptation of Kokonut UI's Liquid Glass Card treatment.
 * Restyled as a flat editorial surface for the trainer's visual language.
 */
export function LiquidCard({
  children,
  className = "",
  ...props
}: LiquidCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[10px] border-2 border-black bg-white ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
