# Zestkit

Zestkit is a free, open-source image compressor for strict upload limits. It requires no account, keeps the source format, and processes static JPG, PNG, and WebP files locally in the browser.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000/compress-image-to-100kb`.

The project uses Webpack for development and production builds because the current parent directory contains non-ASCII characters that trigger a Turbopack path panic. This does not change the runtime behavior of the site.

## Production environment

Copy `.env.example` to `.env.local` and set the final public origin before deployment:

```bash
NEXT_PUBLIC_SITE_URL=https://your-real-domain.com
```

This value is used for canonical URLs, Open Graph URLs, `robots.txt`, and `sitemap.xml`. Do not launch with the localhost fallback.

## Included routes

- `/compress-image-to-20kb`
- `/compress-image-to-100kb`
- `/compress-image-to-200kb`
- `/compress-image-to-1mb`
- `/compress-image-to-2mb`

Each route is statically generated with a unique title, description, H1, scenario copy, quality guidance, FAQ content, and links to the other target-size tools.

## Compression behavior

- Uses decimal limits: `100KB = 100,000 bytes` and `1MB = 1,000,000 bytes`.
- Runs in a Web Worker with `OffscreenCanvas`; no image upload API or large model is used.
- Validates file type, signature, static-image status, dimensions, and final output bytes.
- Keeps an already compliant file byte-for-byte unchanged.
- Searches JPG and WebP quality before reducing dimensions.
- Preserves PNG format and transparency, reducing dimensions only when required.
- Rejects animated PNG/WebP files so animation frames are never silently discarded.
- Continues reducing quality or dimensions until the target is met; it only fails at the browser encoder's technical minimum.
- Shows the original and compressed images in equal preview frames before download.
- Never exposes a download when the verified result exceeds the selected limit.

## Verification

```bash
pnpm lint
pnpm build
```

## V1 boundary

The first release intentionally excludes login, payment, batch queues, API access, output-format controls, and quality sliders. Those features should be considered only after organic traffic and repeat usage validate demand.

## License

Zestkit is open source under the MIT License. See the repository root `LICENSE` file.
