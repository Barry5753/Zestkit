# Contributing to Zestkit

Thank you for helping improve Zestkit. The project accepts focused fixes and improvements to its browser-based image tools, accessibility, documentation, and tests.

## Before opening a pull request

- Open an issue first for a large behavior or interface change so the scope can be agreed before implementation.
- Keep image processing local. A contribution must not add a file-upload dependency to the current compression or conversion flow.
- Preserve exact-size verification. A download must never be presented as successful when its final byte size exceeds the selected limit.
- Match the existing tool structure. Add a focused route and component when a tool solves a genuinely different user task.

## Run the project

```bash
git clone https://github.com/Barry5753/Zestkit.git
cd Zestkit/web
pnpm install
pnpm dev
```

Open <http://localhost:3000/compress-image-to-100kb>.

## Check your change

Run both project checks before submitting a pull request:

```bash
pnpm lint
pnpm build
```

For interface changes, verify the affected page at desktop and mobile widths. For image-processing changes, include a concise reproduction case with the source format, original byte size, requested limit, and observed result.

## Pull request notes

Explain the user problem, the smallest change that solves it, and how you verified the result. Keep unrelated refactors out of the same pull request.
