import type { PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#0e1420] text-slate-100">
      {/* Diagonales del fondo */}
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-[55vh] w-[70vw] rotate-[-18deg] bg-gradient-to-br from-[#1960ff] to-[#0a2cff] opacity-90 [clip-path:polygon(0%_0%,100%_0%,70%_100%,0%_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 -bottom-40 h-[50vh] w-[65vw] -rotate-[18deg] bg-gradient-to-br from-[#93f] to-[#66e6ff] opacity-80 [clip-path:polygon(30%_0%,100%_0%,100%_100%,0%_100%)]"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(41,227,166,.18),transparent_45%),radial-gradient(ellipse_at_top_right,rgba(64,120,255,.18),transparent_40%)]" />
      
      <section className="relative z-10 mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-6">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
