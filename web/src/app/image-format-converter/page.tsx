import type { Metadata } from "next";
import { ArrowRight, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { FormatConverterTool } from "@/components/format-converter-tool";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteName } from "@/lib/site";

const title = "Free Online Image Converter – JPG, PNG & WebP | Zestkit";
const description =
  "Free online image converter for JPG, PNG, WebP, SVG, HEIC and HEIF files. Convert to JPG, PNG or WebP privately in your browser—no upload or signup.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/image-format-converter" },
  openGraph: {
    type: "website",
    siteName,
    url: "/image-format-converter",
    title,
    description,
    locale: "en_US",
  },
};

const faqs = [
  {
    question: "Are images uploaded to a server?",
    answer:
      "No. The conversion is designed to run in your browser, so the selected file stays on your device.",
  },
  {
    question: "What happens to transparency when converting to JPG?",
    answer:
      "JPG does not support transparency. Transparent areas are placed on a white background before export.",
  },
  {
    question: "Can I convert HEIC photos from an iPhone?",
    answer:
      "Yes. HEIC and HEIF files are decoded locally and can be exported as JPG, PNG, or WebP.",
  },
  {
    question: "Can I use this as a JPG converter?",
    answer:
      "Yes. Choose a PNG, WebP, SVG, HEIC, or HEIF image and select JPG as the output format. Transparent areas are placed on a white background.",
  },
];

export default function ImageFormatConverterPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <FormatConverterTool />

        <section className="site-container px-5 pt-8 lg:px-8 lg:pt-10">
          <nav
            aria-label="Related image tools"
            className="grid gap-3 py-4 sm:grid-cols-[116px_minmax(0,1fr)] lg:max-w-[520px]"
          >
            <span className="flex items-center text-sm font-semibold text-muted-foreground">
              Related tool
            </span>
            <Link
              href="/compress-image-to-100kb"
              className="group flex min-h-[76px] items-center justify-between rounded-[10px] border border-border bg-card px-5 py-3 transition-colors hover:border-primary/40 hover:bg-secondary"
            >
              <span>
                <span className="block text-base font-bold text-foreground group-hover:text-primary">
                  Image Compressor
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Reduce an image to a target size
                </span>
              </span>
              <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground" />
            </Link>
          </nav>
        </section>

        <section className="site-container grid gap-12 px-5 py-14 lg:grid-cols-[1.45fr_1fr] lg:px-8 lg:py-20">
          <div>
            <h2 className="text-3xl font-bold tracking-[-0.025em]">
              How to use this online image converter
            </h2>
            <p className="mt-5 max-w-3xl text-[15px] leading-7 text-muted-foreground">
              Use this free online image converter to choose a source image, confirm the detected format, select JPG, PNG, or WebP, and download the converted file. The workflow stays focused—no editor, account, or batch queue.
            </p>

            <ol className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["1", "Choose an image", "JPG, PNG, WebP, SVG, HEIC or HEIF."],
                ["2", "Pick a format", "Select JPG, PNG, or WebP as the output."],
                ["3", "Convert and download", "Save the new file directly to your device."],
              ].map(([number, heading, copy]) => (
                <li key={number} className="rounded-2xl border border-border bg-card p-5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">
                    {number}
                  </span>
                  <h3 className="mt-4 font-bold">{heading}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
                </li>
              ))}
            </ol>
          </div>

          <aside id="faq" className="scroll-mt-6">
            <h2 className="text-2xl font-bold tracking-[-0.02em]">
              Frequently asked questions
            </h2>
            <div className="mt-4 divide-y divide-border border-y border-border">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-1">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 py-3 text-left text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {faq.question}
                    <Plus
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
                    />
                  </summary>
                  <p className="pb-5 pr-8 text-sm leading-6 text-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </aside>
        </section>

        <section id="privacy" className="scroll-mt-6 border-t border-border bg-muted">
          <div className="site-container px-5 py-14 lg:px-8 lg:py-16">
            <div className="flex max-w-3xl items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#bde7d7] bg-[#eaf8f2] text-[#087f5b]">
                <ShieldCheck aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.1em] text-[#087f5b]">
                  PRIVATE BY DEFAULT
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
                  Your image stays in this browser tab
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Format detection, decoding, conversion, and download are designed to happen locally. Closing the tab removes the temporary preview and output URLs.
                </p>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  The project is open source, so you can{" "}
                  <Link
                    href="/open-source"
                    className="font-semibold text-[#087f5b] underline decoration-[#87cdb2] underline-offset-4 hover:text-[#056445]"
                  >
                    inspect the local conversion path
                  </Link>{" "}
                  before choosing a file.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
