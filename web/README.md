# Zestkit

Zestkit is a free, open-source collection of focused browser image tools. It requires no account and processes files locally instead of uploading them to a Zestkit server.

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

This value is used for canonical URLs, Open Graph URLs, `robots.txt`, and `sitemap.xml`. It defaults to `https://zestkit.cc`; set your own public origin when deploying a fork.

## Included routes

- `/compress-image-to-20kb`
- `/compress-image-to-100kb`
- `/compress-image-to-200kb`
- `/compress-image-to-1mb`
- `/compress-image-to-2mb`
- `/image-format-converter`
- `/open-source`

Each compression route is statically generated with a unique title, description, H1, scenario copy, quality guidance, FAQ content, and links to the other target-size tools. The format converter has its own static metadata, focused workflow, and FAQ content.

## Shared UI conventions

- Use the `site-container` utility from `src/app/globals.css` for every site-level region. It stays fluid on smaller screens and stops at 1440px.
- Reuse `SiteHeader`, `RelatedToolLinks`, and `ToolCheckList` across image tools.
- Keep each tool's processing state and browser logic in its own tool component instead of adding mode switches to one universal component.

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

## Format conversion behavior

- Detects file content instead of trusting the filename or browser-provided MIME type.
- Accepts static JPG, PNG, WebP, SVG, HEIC, and HEIF files up to 50MB.
- Outputs JPG, PNG, or WebP while preserving the decoded pixel dimensions.
- Uses a Web Worker for raster and HEIC/HEIF conversion; SVG uses the browser image renderer because Chromium workers cannot decode SVG reliably.
- Uses `heic-to` and its bundled libheif build as the local HEIC/HEIF decoder when the browser cannot decode the file natively.
- Rejects animated PNG and WebP files instead of silently dropping animation frames.
- Rejects SVG scripts, event handlers, embedded HTML, and external resources before rendering.
- Fills transparent pixels with white when exporting JPG because JPG has no alpha channel.
- Verifies the output MIME type, file signature, dimensions, and non-empty byte size before exposing a download.

## Verification

```bash
pnpm lint
pnpm build
```

## V1 boundary

The first release intentionally excludes login, payment, batch queues, API access, resizing controls, and quality sliders. Those features should be considered only after organic traffic and repeat usage validate demand.

## License

Zestkit is open source under the MIT License. See the repository root `LICENSE` file.
