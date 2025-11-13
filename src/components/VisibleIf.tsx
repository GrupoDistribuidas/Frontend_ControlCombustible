import { ReactNode } from "react";

interface VisibleIfProps {
  condition: boolean;
  children: ReactNode;
}

export default function VisibleIf({ condition, children }: VisibleIfProps) {
  if (!condition) return null;
  return <>{children}</>;
}
