# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Frontend for Tahams, a Bangladeshi clothing brand's e-commerce site (storefront + admin dashboard). Next.js 13.4 **Pages Router** (not App Router), React 18, plain JavaScript (`tsconfig.json` exists but source is `.js`), Tailwind + DaisyUI + Flowbite + MUI. Currency is BDT (৳).

The backend is a separate repo at `E:\Tahams\Tahams-backend` and is the source of truth for API contracts — check it directly rather than guessing endpoint shapes.

## Commands

- `npm run dev` — dev server on **port 8000**
- `npm run build` / `npm start` — production build / serve (also port 8000)
- `npm run lint` — `next lint`

There is no test suite configured.

## Environment

`.env` provides `NEXT_PUBLIC_*` vars: Firebase config (`APIKEY`, `AUTHDOMAIN`, `PROJECTID`, ...), `NEXT_PUBLIC_API` (backend base URL, e.g. `http://localhost:3000/api` or `https://tahamsbd.com/api`), `PORT`/`HOSTNAME` (used by `next.config.js` image `remotePatterns`), `GTM_ID`, `FORMSPREE_FORM_ID`, `BKASHCASHBACK`, `LOCATION`, `GOOGLE_PASS`. Images from the backend host must match `remotePatterns` in [next.config.js](next.config.js).

## Architecture

**Imports:** both relative paths and root-absolute paths (`/Hooks/...`, `/Contexts/...`, `/components/...`) are used; `@/*` alias also exists in jsconfig.

**App shell ([pages/_app.js](pages/_app.js)):** wraps everything in `AuthProvider` → `CountProvider` → `CustomizationOrderCountProvider` → react-query `QueryClientProvider`. Routes under `/admin*` are wrapped in `AdminDrawerProvider` + `AdminCheck` (renders 404 for non-admins, verifies via `GET /admin/checkIfAdmin`); all other routes go through `CustomerCheck`. The `QueryClient` is created per App instance via `useState` on purpose (a module-level one leaks cache across SSR requests and causes hydration mismatches) — don't hoist it.

**Auth is two-layered:**
- Firebase Auth (`firebase.js`, `Contexts/Auth/AuthProvider.js`) handles customer sign-in/up (email+password, Google). Consumers use `AuthContext` (`user`, `loading`, `createUser`, `signIn`, `logOut`, ...).
- The backend issues its own JWT, stored in `localStorage.access_token`. `useAxiosSecure` attaches it as a Bearer token and on a 401 clears it and redirects to `/login` (403 does *not* log out). `useAxiosPublic` is an unauthenticated axios instance on the same `NEXT_PUBLIC_API` base URL (though some calls, like `AdminCheck`, pass the header manually).

**Guest checkout:** unauthenticated users get a synthetic identity (`utils/guestCustomer.js`, stored in `localStorage.guestCustomerInfo`, email `guest<ts><rand>@tahamsbd.com`). Cart, orders, etc. key off `user || guestUser` email. Guests track orders via tokens saved in `localStorage.guestOrderTokens`; order lookup requires token + matching email (deliberately no email-only lookup — it'd be an IDOR).

**Data layer:** almost all server data goes through `Hooks/` — thin `@tanstack/react-query` wrappers over axios (`useCart`, `useOrder`, `useLoadProducts`, `useLoadCats`, ...). Add new fetches as hooks there. Backend routes are mostly under `/admin/...` even for customer data (e.g. `/admin/get-all-carts?email=`). Some pages (e.g. home/products) use `getServerSideProps` with react-query `initialData`.

**Pricing:** [utils/pricing.js](utils/pricing.js) mirrors the backend's line-total formula, `ceil((price − discount + vat) × qty)`. Cart, buy-now, payment and order pages must use these helpers so displayed totals equal charged totals. Delivery fee lives in `Contexts/DeliveryFee.js`.

**Pages/components layout:** `pages/` holds routes (storefront: `products/`, `categories/`, `MyCart`, `buy-now`, `confirm-order/[token]`, `my-orders`, `customize-tee`, `combo-builder`, plus static info pages; admin: `pages/admin/*` for products, inventory, payments, promotions, reports, analytics, settings, etc.). `components/` is grouped by feature (`Admin`, `Cart`, `Product`, `Header`, `Drawers`, ...); `components/Admin` contains shared admin UI primitives (`AdminForm`, `AdminTable`, `AdminUI`). Order status logic is in `utils/orderStatus.js` / `Hooks/useOrderStatus.js`; GA4/GTM tracking in `utils/ga4.js`.

**Other:** `functions/` and `Drafts/` are scratch/auxiliary (not part of the Next build path). Rich-text editing uses draft-js / react-draft-wysiwyg; Excel export uses `xlsx`; image compression uses `browser-image-compression`/`pica`.
