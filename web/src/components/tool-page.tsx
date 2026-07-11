import { CircleCheck, Plus } from "lucide-react";

import { CompressorTool } from "@/components/compressor-tool";
import { RelatedToolLinks } from "@/components/related-tool-links";
import { SiteHeader } from "@/components/site-header";
import type { TargetPage } from "@/config/target-pages";

export function ToolPage({ page }: { page: TargetPage }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <CompressorTool
          initialTargetKilobytes={page.targetKilobytes}
          initialTargetLabel={page.targetLabel}
        />

        <section className="mx-auto w-full max-w-[1240px] px-5 pt-8 lg:px-8 lg:pt-10">
          <div>
            <RelatedToolLinks currentPage={page} />
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-[1240px] gap-12 px-5 py-14 lg:grid-cols-[1.45fr_1fr] lg:px-8 lg:py-20">
          <div>
            <h2 className="text-3xl font-bold tracking-[-0.025em] text-foreground">
              {page.seoHeading}
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-7 text-muted-foreground">
              {page.introParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

          </div>

          <aside id="faq" className="scroll-mt-6">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-foreground">
              Frequently asked questions
            </h2>
            <div className="mt-4 divide-y divide-border border-y border-border">
              {page.faqs.map((faq) => (
                <details key={faq.question} className="group py-1">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 py-3 text-left text-sm font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    {faq.question}
                    <Plus
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
                    />
                  </summary>
                  <p className="pb-5 pr-8 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </aside>
        </section>

        <section className="border-t border-border bg-muted">
          <div className="mx-auto grid w-full max-w-[1240px] gap-12 px-5 py-14 lg:grid-cols-[1.45fr_1fr] lg:px-8 lg:py-20">
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.02em] text-foreground">
                How to compress an image to {page.targetLabel}
              </h2>
              <ol className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  ["1", "Choose one image", "Select a static JPG, PNG, or WebP file up to 50MB."],
                  ["2", `Keep ${page.targetLabel} or adjust it`, "The value is a maximum output size, measured with decimal kilobytes."],
                  ["3", "Compress and download", "Wait for local encoding, then download only after the byte check passes."],
                ].map(([number, title, description]) => (
                  <li key={number} className="rounded-2xl border border-border bg-card p-5">
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#eaf1ff] text-sm font-bold text-primary">
                      {number}
                    </span>
                    <h3 className="mt-4 font-bold text-foreground">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-12 grid gap-8 sm:grid-cols-2">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Common uses</h2>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                    {page.useCases.map((useCase) => (
                      <li key={useCase} className="flex gap-3">
                        <CircleCheck aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#087f5b]" />
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Quality tips</h2>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                    {page.qualityTips.map((tip) => (
                      <li key={tip} className="flex gap-3">
                        <CircleCheck aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#087f5b]" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <aside id="privacy" className="h-fit scroll-mt-6 rounded-2xl border border-[#bde7d7] bg-[#eaf8f2] p-6">
              <p className="text-xs font-bold tracking-[0.1em] text-[#087f5b]">PRIVATE BY DEFAULT</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-foreground">
                Your file stays in this browser tab
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Zestkit does not need an upload API for compression. The browser reads the selected file, runs the encoder in a worker, verifies the resulting bytes, and creates a temporary local download URL. No login, email address, or payment is required.
              </p>
            </aside>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>Zestkit — exact-size image compression in your browser.</p>
          <p>No uploads · No account · No payment</p>
        </div>
      </footer>
    </div>
  );
}
