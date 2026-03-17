# mobile-haptic-web

Proof-of-concept workspace that includes:

- `packages/haptic-text`: publishable React package using [`web-haptics`](https://github.com/lochie/web-haptics)
- `apps/demo`: GitHub Pages-ready full-screen carousel demo

## Install

```bash
npm install
```

## Run demo locally

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Package outputs

Build just the npm package:

```bash
npm run build:package
```

Build just the static demo:

```bash
npm run build:demo
```

## Demo slides

1. Home screen
2. `TruncatedText` (UUID + email built-in patterns, copy interaction)
3. Haptic radio preset selector
4. Drawer snap-point haptics
5. AI streaming text haptics
6. Closing slide linking back to [j0e.me](https://j0e.me)

## GitHub Pages

Deploy is configured in `.github/workflows/deploy-demo.yml` and publishes `apps/demo/dist`.
