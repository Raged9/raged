import TypingGame from "@/components/sections/TypingGame";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Type-O-Matic Typewriter • Edgar ('Raged')",
  description: "Test your typing speed and accuracy on the vintage Olive Green typewriter terminal.",
};

export default function TypewriterPage() {
  return (
    <main className="min-h-screen relative flex flex-col items-center justify-between bg-[#FBFAF9] text-[#302f2d] px-4 py-8">
      {/* Tayo's distinctive dashed vertical margin lines */}
      <div className="hidden lg:block h-full min-h-screen z-20 absolute left-8 xl:left-24 border text-black/10 border-long-dashed pointer-events-none" />
      <div className="hidden lg:block h-full min-h-screen z-20 absolute right-8 xl:right-24 border text-black/10 border-long-dashed pointer-events-none" />

      {/* Top Navbar */}
      <div className="w-full max-w-304 mx-auto px-6 md:px-9 flex items-center justify-between py-4">
        <Link
          href="/"
          className="font-bold text-xl tracking-tight text-base hover:opacity-80 transition-opacity"
        >
          edgar<span className="text-base/40">.</span>
        </Link>

        <Link
          href="/#boarding-pass"
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-[#302f2d]/5 hover:bg-[#302f2d]/10 text-[#302f2d] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Portfolio</span>
        </Link>
      </div>

      {/* Typewriter Component */}
      <div className="flex-1 w-full flex items-center justify-center py-6">
        <TypingGame showBackLink={false} />
      </div>

      {/* Bottom Footer Note */}
      <div className="w-full max-w-304 mx-auto px-6 md:px-9 text-center text-xs text-[#302f2d]/40 py-6 border-t border-black/[0.04]">
        <p className="font-monocraft text-[11px]">
          Type-O-Matic Terminal • Royal Model 10 Olive Edition • Edgar (&quot;Raged&quot;)
        </p>
      </div>
    </main>
  );
}
