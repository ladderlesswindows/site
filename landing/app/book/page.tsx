import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export default function BookPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Consistent top bar with compact logo */}
      <div className="pt-6 pb-4 px-6 border-b border-neutral-100">
        <div className="mx-auto max-w-2xl flex justify-center">
          <Link href="/" className="block">
            <Logo className="w-full max-w-[240px]" variant="compact" />
          </Link>
        </div>
      </div>

      {/* Main content - centered, clean, under construction */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md text-center">
          <div className="inline-block mb-6 rounded-full bg-neutral-100 px-4 py-1 text-xs font-semibold tracking-[2px] text-neutral-500">
            COMING SOON
          </div>

          <h1 className="text-5xl font-semibold tracking-[-1.8px] leading-none">
            Under Construction
          </h1>

          <div className="mt-6 space-y-3 text-lg text-neutral-600 leading-relaxed">
            <p>This page is under construction.</p>
            <p>More features coming soon!</p>
          </div>

          <Link
            href="/"
            className="mt-10 inline-flex items-center justify-center px-8 py-3.5 rounded-2xl border-2 border-neutral-900 text-neutral-900 font-semibold tracking-wide hover:bg-neutral-900 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
