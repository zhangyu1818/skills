---
name: setup-tailwindcss
description: Install and integrate Tailwind CSS (latest) in existing Vite or Next.js projects using the official Tailwind CSS Vite plugin or PostCSS plugin. Use when a user asks to add Tailwind CSS to an existing Vite/Next.js app.
---

# Setup Tailwind CSS (Vite, Next.js)

## Scope

- Only handle Vite and Next.js.
- Assume the project already exists (no project initialization steps).
- Follow the official Tailwind CSS v4 install flow for each platform.

## Decision

- If the project is Vite, follow the Vite steps.
- If the project is Next.js, follow the Next.js steps.
- If the project is neither, ask the user to confirm the framework.

## Vite (official plugin)

1. Ensure you are in the project root.

2. Install Tailwind CSS (latest) and the Vite plugin:

```bash
npm install tailwindcss@latest @tailwindcss/vite
```

3. Configure the Vite plugin in `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

4. Import Tailwind CSS in your main CSS file (for example `src/style.css`):

```css
@import "tailwindcss";
```

5. Start the dev server:

```bash
npm run dev
```

6. Verify Tailwind works by using a utility class in your HTML or JSX.

## Next.js (PostCSS plugin)

1. Ensure you are in the project root.

2. Install Tailwind CSS (latest) and PostCSS plugin:

```bash
npm install tailwindcss@latest @tailwindcss/postcss postcss
```

3. Create `postcss.config.mjs` in the project root:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

4. Import Tailwind CSS in `app/globals.css`:

```css
@import "tailwindcss";
```

5. Start the dev server:

```bash
npm run dev
```

6. Verify Tailwind works by using a utility class in a page component.
