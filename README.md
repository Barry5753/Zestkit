# Zestkit

Zestkit is a free, open-source, privacy-first image compressor for exact file-size targets. It keeps the uploaded image format, processes files locally in the browser, verifies the final byte size, and shows the original and compressed images side by side.

## Project structure

- `web/` — Next.js application

## Run locally

```bash
cd web
pnpm install
pnpm dev
```

Open [http://localhost:3000/compress-image-to-100kb](http://localhost:3000/compress-image-to-100kb).

## Stack

- Next.js App Router
- React
- Tailwind CSS
- shadcn/ui and Radix UI
- Browser-native image encoding in a Web Worker

Set `NEXT_PUBLIC_SITE_URL` to the production origin before deployment so canonical URLs, Open Graph URLs, robots.txt, and sitemap.xml use the live domain.

## License

Zestkit is available under the [MIT License](LICENSE).
