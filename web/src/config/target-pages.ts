export type FaqItem = {
  question: string;
  answer: string;
};

export type TargetPage = {
  slug: string;
  targetLabel: string;
  targetKilobytes: number;
  targetBytes: number;
  metaTitle: string;
  metaDescription: string;
  heroDescription: string;
  seoHeading: string;
  introParagraphs: string[];
  useCases: string[];
  qualityTips: string[];
  faqs: FaqItem[];
};

export const targetPages: TargetPage[] = [
  {
    slug: "compress-image-to-20kb",
    targetLabel: "20KB",
    targetKilobytes: 20,
    targetBytes: 20_000,
    metaTitle: "Compress Image to 20KB – Free & Private | Zestkit",
    metaDescription:
      "Compress JPG, PNG, or WebP images to 20KB or less for free in your browser. No upload or signup. Verify the final size before downloading.",
    heroDescription:
      "Reduce JPG, PNG, or WebP files to 20KB or less — locally in your browser.",
    seoHeading: "Make an image small enough for strict 20KB upload limits",
    introParagraphs: [
      "A 20KB image limit is unusually strict. It is most common on older application portals, small profile-photo fields, exam forms, and systems designed for low-bandwidth connections. Zestkit first lowers encoding quality and then reduces dimensions only when needed, while checking the real file size after every attempt.",
      "Because 20KB leaves very little room for image data, a large photograph may need a noticeably smaller resolution. Start with a tightly cropped image and remove empty background areas before compression. Zestkit continues reducing the image until it meets the target, then lets you judge the visible result in the side-by-side preview.",
      "Use the downloaded file only after checking that a face, signature, stamp, or required text is still recognizable. If the receiving form publishes a required pixel size as well as a byte limit, confirm both rules before submission because a file can meet one requirement and fail the other.",
    ],
    useCases: [
      "Small ID or profile photographs for legacy application portals",
      "Exam, scholarship, and recruitment forms with a 20KB photo field",
      "Compact thumbnails for low-bandwidth pages",
      "Simple signatures, stamps, and document images with little visual detail",
    ],
    qualityTips: [
      "Crop the image around the subject before compressing so pixels are not spent on unused background.",
      "Simple photographs usually compress better than screenshots containing small text and sharp edges.",
      "If 20KB makes the result too small to read, confirm whether the portal also accepts a 100KB or 200KB file.",
    ],
    faqs: [
      {
        question: "Can every image be compressed to 20KB?",
        answer:
          "Most static images can reach 20KB, but detailed photographs, transparent PNG files, and screenshots may need very small dimensions. Zestkit creates the valid under-limit result and lets you compare it with the original before downloading.",
      },
      {
        question: "Will the result be exactly 20KB?",
        answer:
          "The result will be 20,000 bytes or less when compression succeeds. It may be smaller because image encoders do not produce every possible byte size.",
      },
      {
        question: "Is my 20KB image uploaded anywhere?",
        answer:
          "No. Selection, decoding, compression, byte verification, and download happen in your browser. The page does not send the image to a Zestkit server.",
      },
      {
        question: "Will Zestkit change the image format to reach 20KB?",
        answer:
          "No. A JPG stays JPG, a PNG stays PNG, and a WebP stays WebP. PNG sources may require a greater reduction in dimensions because browser PNG encoding is lossless.",
      },
    ],
  },
  {
    slug: "compress-image-to-100kb",
    targetLabel: "100KB",
    targetKilobytes: 100,
    targetBytes: 100_000,
    metaTitle: "Compress Image to 100KB – Free & Private | Zestkit",
    metaDescription:
      "Compress JPG, PNG, or WebP images to 100KB or less for free. Files stay on your device, no signup required. Download a verified compressed result.",
    heroDescription:
      "Reduce JPG, PNG, or WebP files to 100KB or less — locally in your browser.",
    seoHeading: "Meet strict image upload limits",
    introParagraphs: [
      "Passport, visa, job application, school, and government forms often reject an image that is even slightly above their stated limit. Zestkit measures the actual encoded file after each compression attempt and only presents a download when the result is 100,000 bytes or less.",
      "The compressor keeps the original dimensions when possible. If changing encoding quality is not enough, it gradually reduces the image dimensions and tries again. This balances useful visual quality with a hard upload limit instead of relying on a generic percentage slider.",
      "A successful result is measured from the final encoded Blob rather than an estimate shown before compression. That distinction matters for official portals, where a difference of only a few bytes can cause rejection. The original file remains available on your device and is never replaced automatically.",
    ],
    useCases: [
      "Passport, visa, residency, and identity document portals",
      "Job applications, recruitment systems, and employee profiles",
      "School, university, scholarship, and examination forms",
      "Government services and document uploads with a 100KB maximum",
    ],
    qualityTips: [
      "Use the original image rather than repeatedly compressing an already compressed copy.",
      "Crop unnecessary background areas before compression to preserve more detail in the subject.",
      "Check the downloaded image at normal viewing size before submitting it to an official portal.",
    ],
    faqs: [
      {
        question: "Is my image uploaded to a server?",
        answer:
          "No. Your browser decodes, compresses, and verifies the image locally. The file does not need to leave your device, and no account is required.",
      },
      {
        question: "Will the result be exactly 100KB?",
        answer:
          "A successful result is 100,000 bytes or less, not necessarily exactly 100KB. The final Blob size is measured after encoding, and the original and compressed previews remain visible for comparison.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Zestkit accepts static JPG, PNG, and WebP files up to 50MB. Animated PNG and animated WebP files are rejected so that the tool never silently drops animation frames.",
      },
      {
        question: "Does compression reduce image quality?",
        answer:
          "It can. The tool first adjusts encoding quality for JPG and WebP images, then reduces dimensions when needed. PNG files may need more resizing because browser PNG encoding is lossless.",
      },
      {
        question: "What if reaching 100KB requires a strong reduction?",
        answer:
          "Zestkit still creates the valid result instead of blocking it. The compressed image remains beside the original so you can judge whether it is readable before downloading or choosing a larger target.",
      },
    ],
  },
  {
    slug: "compress-image-to-200kb",
    targetLabel: "200KB",
    targetKilobytes: 200,
    targetBytes: 200_000,
    metaTitle: "Compress Image to 200KB – Free & Private | Zestkit",
    metaDescription:
      "Compress JPG, PNG, or WebP images to 200KB or less for free. Processing stays in your browser, final size is verified, and no account is required.",
    heroDescription:
      "Reduce JPG, PNG, or WebP files to 200KB or less — locally in your browser.",
    seoHeading: "Create a clear image that fits a 200KB form limit",
    introParagraphs: [
      "A 200KB limit gives most document photographs enough room to remain clear while still loading quickly. It is frequently used for ID images, property records, insurance claims, application forms, and online service portals. Zestkit verifies the finished file in bytes so you do not have to repeat an upload after a near miss.",
      "For JPG and WebP photographs, the tool searches for a high encoding quality at the current dimensions before resizing. PNG images keep their format and transparency, although detailed PNG files may need smaller dimensions to reach the same limit.",
      "After downloading, open the result and inspect important edges, small text, and facial details at normal size. A file can satisfy the 200KB rule while still being unsuitable for a particular form, so the receiving portal’s pixel dimensions, aspect ratio, and document-content rules should also be checked.",
    ],
    useCases: [
      "ID photographs and scanned supporting documents",
      "Insurance, banking, tax, and property service portals",
      "Product or listing images with a modest upload cap",
      "Application forms that reject files above 200KB",
    ],
    qualityTips: [
      "Start from a sharp source and let the compressor work from the original pixels.",
      "Avoid adding large borders or extra canvas space around a document photograph.",
      "Keep PNG when transparency matters; otherwise a photographic JPG or WebP source often compresses more efficiently.",
    ],
    faqs: [
      {
        question: "How is the 200KB limit measured?",
        answer:
          "Zestkit treats 200KB as 200,000 bytes and checks the actual Blob size produced by the browser. A successful download never exceeds that value.",
      },
      {
        question: "Can I use the tool for scanned documents?",
        answer:
          "Yes, if the scan is a static JPG, PNG, or WebP image. Crop empty margins first and confirm that small text remains readable after compression.",
      },
      {
        question: "Does Zestkit keep a copy of the image?",
        answer:
          "No. The compressor runs on your device. Closing the page removes its temporary in-browser result URL, and no file is stored in a Zestkit account.",
      },
      {
        question: "Why is a PNG result larger than a JPG result?",
        answer:
          "PNG preserves pixels and transparency without photographic quality loss, which can cost more bytes. JPG and WebP use lossy encoding that is usually more efficient for photographs.",
      },
    ],
  },
  {
    slug: "compress-image-to-1mb",
    targetLabel: "1MB",
    targetKilobytes: 1_000,
    targetBytes: 1_000_000,
    metaTitle: "Compress Image to 1MB – Free Local Compressor | Zestkit",
    metaDescription:
      "Compress an image to 1MB or less for free without uploading it. Supports JPG, PNG, and WebP, verifies final size, and works without signup.",
    heroDescription:
      "Reduce JPG, PNG, or WebP files to 1MB or less — locally in your browser.",
    seoHeading: "Reduce an image to 1MB while keeping useful detail",
    introParagraphs: [
      "One megabyte is a practical target for email attachments, content management systems, support tickets, marketplace listings, and web forms. It usually allows a large photograph to keep substantial detail while removing the excess bytes created by modern phone cameras.",
      "Zestkit starts at the original dimensions and looks for a result below 1,000,000 bytes. It only lowers dimensions when quality changes alone cannot meet the target. The final file is decoded again and measured before the download becomes available.",
      "For website publishing, a 1MB ceiling is only one part of image performance. Display the result at appropriate dimensions, reserve its layout space, and avoid loading a full-resolution file into a small thumbnail slot. Those steps reduce transfer cost and prevent avoidable layout movement for visitors.",
    ],
    useCases: [
      "Email attachments and customer support uploads",
      "Blog, CMS, and knowledge-base images",
      "Marketplace, classified, and product listing photographs",
      "Forms with a 1MB evidence or document-image limit",
    ],
    qualityTips: [
      "A 1MB target is often large enough to keep the original dimensions of ordinary web images.",
      "For camera photos, remove unused edges before compression to retain more detail where it matters.",
      "If the image is intended for a website, also set explicit display dimensions to prevent layout shifts.",
    ],
    faqs: [
      {
        question: "Is 1MB measured as 1,000KB or 1,024KB?",
        answer:
          "This tool uses the decimal file-size convention common in browser and upload interfaces: 1MB equals 1,000,000 bytes.",
      },
      {
        question: "Will a 1MB image look different?",
        answer:
          "The difference depends on the source. Many web images need only a modest encoding change, while very large camera files may also need reduced dimensions.",
      },
      {
        question: "Can I compress confidential screenshots?",
        answer:
          "The image is processed locally rather than uploaded to Zestkit. You should still review the screenshot itself and remove sensitive content before sharing the downloaded file.",
      },
      {
        question: "Can I compress several images at once?",
        answer:
          "The first version handles one image at a time to keep the workflow fast and predictable. Batch compression can be added after the single-image experience is proven.",
      },
    ],
  },
  {
    slug: "compress-image-to-2mb",
    targetLabel: "2MB",
    targetKilobytes: 2_000,
    targetBytes: 2_000_000,
    metaTitle: "Compress Image to 2MB – Free & Private | Zestkit",
    metaDescription:
      "Compress JPG, PNG, or WebP images to 2MB or less for free in your browser. Keep files on your device, verify output size, and download without signup.",
    heroDescription:
      "Reduce JPG, PNG, or WebP files to 2MB or less — locally in your browser.",
    seoHeading: "Prepare a high-resolution image for a 2MB upload limit",
    introParagraphs: [
      "A 2MB maximum is common for marketplace images, insurance evidence, property listings, school portals, and account verification. It is generous enough for a clear, high-resolution photograph but can still reject uncompressed files from modern phones and cameras.",
      "Zestkit compares the actual encoded output with 2,000,000 bytes. If the source already fits, it returns the original bytes unchanged. Otherwise it searches for a smaller result and keeps the original dimensions whenever the chosen format can meet the limit.",
      "Before submitting an important document image, verify that the portal accepts the file format and that all required information remains inside the crop. The 2MB result is created as a new download, so you can compare it with the source and keep the original untouched for later use.",
    ],
    useCases: [
      "High-resolution listing and marketplace photographs",
      "Insurance claims, property records, and service evidence",
      "Account verification and identity-document images",
      "School, workplace, and application portals with a 2MB cap",
    ],
    qualityTips: [
      "Use the file produced by the tool rather than a screenshot of the image, which can increase file size or reduce clarity.",
      "Keep the source format when transparency or sharp line art is important.",
      "If the image is already under 2MB, Zestkit preserves its original bytes instead of recompressing it unnecessarily.",
    ],
    faqs: [
      {
        question: "What happens when the original is already under 2MB?",
        answer:
          "The original file is returned byte-for-byte. Recompressing an image that already meets the limit would add processing time and could reduce quality without any benefit.",
      },
      {
        question: "Does the tool change image dimensions?",
        answer:
          "Only when the encoder cannot meet the 2MB target at the original dimensions. The compressor tries quality changes first for JPG and WebP files.",
      },
      {
        question: "Are transparent images supported?",
        answer:
          "Yes. Static PNG and WebP images are supported. PNG transparency is preserved because the tool does not silently convert a transparent image to JPG.",
      },
      {
        question: "Where is the compressed image stored?",
        answer:
          "It exists temporarily in your browser as a local Blob until you download it, choose another image, or close the page. Zestkit does not store it on a server.",
      },
    ],
  },
];

export function getTargetPage(slug: string) {
  return targetPages.find((page) => page.slug === slug);
}
