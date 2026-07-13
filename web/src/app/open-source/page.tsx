import type { Metadata } from "next";
import {
  ArrowRight,
  Check,
  Code2,
  ExternalLink,
  FileCheck2,
  HardDriveDownload,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import Link from "next/link";

import { GitHubMark } from "@/components/github-mark";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { githubRepositoryUrl, siteName } from "@/lib/site";

const title = "Open Source Image Compressor – Private & Free | Zestkit";
const description =
  "Inspect Zestkit's MIT-licensed image compressor, verify local browser processing, run it yourself, and see how exact output sizes are checked before download.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/open-source" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName,
    url: "/open-source",
    title,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

const sourceFiles = [
  {
    path: "web/src/workers/compress-image.worker.ts",
    label: "Compression worker",
    description:
      "Follow the quality search, dimension reduction, and final byte-limit check away from the main UI thread.",
  },
  {
    path: "web/src/lib/image-compression.ts",
    label: "Validation and job control",
    description:
      "Inspect file signatures, static-image checks, worker messages, cancellation, and result verification.",
  },
  {
    path: "web/src/workers/convert-image.worker.ts",
    label: "Format conversion worker",
    description:
      "See how supported images are decoded and exported locally as JPG, PNG, or WebP.",
  },
];

const localProcessingSteps = [
  {
    number: "01",
    heading: "Read locally",
    description:
      "The browser reads the file you choose; the page does not post it to an upload endpoint.",
  },
  {
    number: "02",
    heading: "Encode in a worker",
    description:
      "Compression and conversion run away from the main interface so the page stays responsive.",
  },
  {
    number: "03",
    heading: "Measure real bytes",
    description:
      "Zestkit checks the encoded Blob rather than predicting a result from a quality percentage.",
  },
  {
    number: "04",
    heading: "Download locally",
    description:
      "A temporary object URL connects the verified result directly to your browser download.",
  },
];

const openSourceBenefits = [
  {
    icon: LockKeyhole,
    heading: "No hidden upload path",
    description:
      "Inspect the file flow and confirm that compression does not depend on a Zestkit image-storage service.",
  },
  {
    icon: FileCheck2,
    heading: "Verified output size",
    description:
      "Read the final Blob-size check that runs before a successful compressed result is exposed for download.",
  },
  {
    icon: HardDriveDownload,
    heading: "Self-hostable",
    description:
      "Run the same interface and workers locally or deploy your own copy without creating a Zestkit account.",
  },
  {
    icon: Scale,
    heading: "MIT licensed",
    description:
      "Use, study, modify, and distribute the project under a short, permissive open-source license.",
  },
];

const openSourceFaqs = [
  {
    question: "Is the whole image-processing path open source?",
    answer:
      "Yes. The browser interface, validation code, compression worker, conversion worker, and final result checks are all available in the public repository.",
  },
  {
    question: "Can I run Zestkit on my own computer?",
    answer:
      "Yes. Clone the repository, install the web app dependencies with pnpm, and start the local Next.js development server. The exact commands are shown on this page and in the README.",
  },
  {
    question: "Can I reuse the code in another project?",
    answer:
      "Zestkit is released under the MIT License. You may use, copy, modify, and distribute it under the terms in the repository's LICENSE file.",
  },
];

export default function OpenSourcePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,#e4e1da_1px,transparent_1px),linear-gradient(to_bottom,#e4e1da_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]"
          />
          <div className="site-container relative grid gap-12 px-5 py-16 sm:px-7 sm:py-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(460px,1.05fr)] lg:items-center lg:gap-20 lg:px-8 lg:py-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#bde7d7] bg-[#eaf8f2] px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-[#087f5b]">
                <GitHubMark aria-hidden="true" className="size-4" />
                PUBLIC REPOSITORY · MIT LICENSED
              </div>
              <h1 className="mt-7 max-w-[700px] text-[46px] leading-[1.03] font-bold tracking-[-0.055em] text-foreground sm:text-[60px] lg:text-[68px]">
                An open-source image compressor you can verify.
              </h1>
              <p className="mt-7 max-w-[640px] text-lg leading-8 text-muted-foreground">
                Zestkit says your images stay in the browser. You do not have to take that sentence on trust: trace the processing path, inspect every network boundary, or run the same code yourself.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={githubRepositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-foreground px-5 text-sm font-bold text-background transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <GitHubMark aria-hidden="true" className="size-[18px]" />
                  View source on GitHub
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
                <Link
                  href="/compress-image-to-100kb"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-border bg-card px-5 text-sm font-bold text-foreground transition-colors hover:border-primary/35 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Try the live compressor
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#262b35] bg-[#15181f] text-[#f7f4ec] shadow-[0_28px_80px_rgba(25,32,45,0.2)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-xs">
                <span className="flex items-center gap-2 font-semibold text-white/90">
                  <ShieldCheck aria-hidden="true" className="size-4 text-[#63d9a5]" />
                  Local processing trace
                </span>
                <span className="font-mono text-white/45">zestkit.cc</span>
              </div>
              <ol className="divide-y divide-white/10">
                {localProcessingSteps.map((step) => (
                  <li key={step.number} className="grid grid-cols-[42px_1fr] gap-3 px-5 py-5 sm:grid-cols-[52px_150px_1fr] sm:items-start">
                    <span className="font-mono text-xs text-[#63d9a5]">{step.number}</span>
                    <span className="text-sm font-bold">{step.heading}</span>
                    <span className="col-start-2 text-sm leading-6 text-white/60 sm:col-start-3">
                      {step.description}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="flex items-center gap-2 border-t border-white/10 bg-white/[0.03] px-5 py-4 font-mono text-xs text-[#63d9a5]">
                <Check aria-hidden="true" className="size-4" />
                upload endpoint: not required
              </div>
            </div>
          </div>
        </section>

        <section id="privacy" className="scroll-mt-6 border-b border-border bg-card">
          <div className="site-container grid gap-10 px-5 py-16 sm:px-7 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8 lg:py-24">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-primary">VERIFY THE CLAIM</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Follow the code, not the promise.
              </h2>
              <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground">
                The public repository is useful because it connects a privacy statement to concrete implementation. Start with the file boundary, continue through the worker, and finish at the measured Blob that becomes your download.
              </p>
            </div>

            <div className="divide-y divide-border border-y border-border">
              {sourceFiles.map((sourceFile) => (
                <a
                  key={sourceFile.path}
                  href={`${githubRepositoryUrl}/blob/main/${sourceFile.path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group grid gap-3 py-6 sm:grid-cols-[minmax(190px,0.72fr)_1fr_auto] sm:items-start sm:gap-6"
                >
                  <div>
                    <p className="font-bold text-foreground transition-colors group-hover:text-primary">
                      {sourceFile.label}
                    </p>
                    <code className="mt-2 block break-all text-[11px] leading-5 text-muted-foreground">
                      {sourceFile.path}
                    </code>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {sourceFile.description}
                  </p>
                  <ExternalLink aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="site-container px-5 py-16 sm:px-7 lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.12em] text-primary">WHY OPEN SOURCE MATTERS HERE</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Built for evidence, not a trust badge.
              </h2>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
              {openSourceBenefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                <article key={benefit.heading} className="bg-background p-6 sm:p-7">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-card text-primary">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <h3 className="mt-6 font-bold">{benefit.heading}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {benefit.description}
                  </p>
                </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-muted">
          <div className="site-container grid gap-10 px-5 py-16 sm:px-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20 lg:px-8 lg:py-24">
            <div>
              <span className="flex size-12 items-center justify-center rounded-xl border border-border bg-card text-primary">
                <Terminal aria-hidden="true" className="size-5" />
              </span>
              <h2 className="mt-6 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Run Zestkit locally.
              </h2>
              <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground">
                The repository contains one Next.js application in the <code className="rounded bg-card px-1.5 py-0.5 text-xs text-foreground">web</code> directory. No database, account system, or image-processing API is required for the current tools.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#262b35] bg-[#15181f] shadow-[0_22px_60px_rgba(25,32,45,0.16)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                <span className="flex items-center gap-2 text-xs font-semibold text-white/75">
                  <Code2 aria-hidden="true" className="size-4" />
                  Terminal
                </span>
                <span className="font-mono text-[10px] text-white/35">three commands</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7 text-[#e9e5db] sm:p-7 sm:text-sm">
                <code>{`git clone ${githubRepositoryUrl}.git\ncd Zestkit/web\npnpm install && pnpm dev`}</code>
              </pre>
              <div className="border-t border-white/10 px-5 py-4 text-xs text-white/45 sm:px-7">
                Open <span className="font-mono text-[#63d9a5]">localhost:3000/compress-image-to-100kb</span>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-6">
          <div className="site-container grid gap-10 px-5 py-16 sm:px-7 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8 lg:py-24">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-primary">USE OR CONTRIBUTE</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Take a closer look.
              </h2>
              <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground">
                Try the live tools first, read the code path that matters to you, or open a focused issue when you find a reproducible problem.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/image-format-converter"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
                >
                  Try the format converter
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <a
                  href={`${githubRepositoryUrl}/issues`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
                >
                  View GitHub issues
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              </div>
            </div>

            <div className="divide-y divide-border border-y border-border">
              {openSourceFaqs.map((faq) => (
                <details key={faq.question} className="group py-1">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 text-left font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    {faq.question}
                    <span className="font-mono text-lg font-normal text-muted-foreground group-open:hidden">+</span>
                    <span className="hidden font-mono text-lg font-normal text-muted-foreground group-open:inline">−</span>
                  </summary>
                  <p className="max-w-2xl pb-6 pr-8 text-sm leading-7 text-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
