import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

interface VisibleIfProps {
  condition: boolean;
  children: ReactNode;
}

export default function VisibleIf({ condition, children }: VisibleIfProps) {
  if (!condition) return null;
  return <>{children}</>;
}
