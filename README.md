# ShopNest

A full-stack, minimal black-and-gold storefront for home and technology essentials. This replaces the original browser-only `index.html` implementation.

## Store owner

Open `/admin` and sign in with the store owner's ChatGPT account (`lasin90746@gmail.com`). The application checks that authenticated account on every management API request. There is no shared browser password. This project relies on the Sites platform to validate and inject identity headers; do not deploy it behind an untrusted proxy that forwards caller-provided identity headers.

1. Add a product, upload up to four images, enter its actual price and stock, and choose **Live** when ready.
2. Set contact details, delivery charges, delivery information and returns information in **Store settings**.
3. Manage incoming orders under **Orders**. Confirm availability with the customer and progress through Confirmed → Packed → On the way → Delivered.
4. Add a courier HTTPS tracking link and customer-visible update as needed. Cancelling an unshipped order returns its items to stock exactly once.

The initial catalogue is intentionally empty. The old implementation stored products separately in each browser, so there is no shared product database to migrate from the GitHub repository. Add the real catalogue from your existing records. The generated campaign image is illustrative and is never presented as purchasable stock.

## Implemented behavior

- D1-backed products, settings, customer orders, order lines, inventory and request limits.
- R2-backed JPG, PNG and WebP uploads, validated by file signature and bounded to 5 MB.
- Owner-authorized product, order, settings and upload APIs, with same-origin write checks.
- Persistent device-local shopping bag with quantity controls and removal. Prices and stock are always checked server-side.
- Server-computed shipping and totals; all money stored as integer paise.
- Transactional order insertion and stock reservations. Invalid, repriced, unpublished or unavailable products roll back the entire order.
- Idempotency keys stop retries from creating duplicate orders. Confirmation appears only after persistence succeeds.
- Customer tracking requires both an unpredictable order reference and matching mobile number; customer address and phone are never returned by the tracking endpoint.
- Optimistic concurrency protects product, order and settings edits. Concurrent cancellation cannot duplicate stock returns.
- Product search, category filters, sorting, product galleries, responsive cart/checkout, management dashboard, real settings and order history pagination.
- No fake reviews, supplier-sync indicators, catalog import, or order tracking buttons.

## Operations and deployment

This is a server application, **not** a static single-page upload. It uses Vinext/React on Cloudflare Workers through Sites, with the starter's maintained Sites build integration. The hosting manifest declares `DB` and `BUCKET`. Database schema is in `db/schema.ts`; generated schema-only migrations are in `drizzle/` and are applied by Sites publication.

New Sites are private by default. The owner must intentionally enable public access before real customers can visit. Cash-on-delivery fulfilment is manual. The order dashboard is the source of truth; the application does not automatically send email/WhatsApp messages or connect to Meesho. The optional post-order WhatsApp link starts a message the customer chooses to send.

No old site hosting configuration has been changed. The rebuilt version is deployed separately for review.

## Development and verification

Use Node 24+ for the supplied tests (`node:sqlite`) and install dependencies from `pnpm-lock.yaml`. Use the Sites skill's environment-specific setup/build helpers in managed environments.

```sh
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
node --test tests/*.test.mjs
pnpm run build
```

The tests exercise account authorization, phone/PIN validation, product constraints, checkout validation, duplicate-item quantity limits, delivery calculation, status transitions, tracking inputs, actual SQLite transaction rollback, stock reservation, idempotency, stale-price protection, cancellation races and stale admin edits.

Local test databases are isolated and contain synthetic data. Tests do not create real orders or send messages. Browser rendering and real courier/physical delivery have not been verified in this environment; no supported browser QA tool is available.

The owner allowlist is in `lib/domain.ts`. Update it deliberately if store ownership changes. Production credentials are managed outside the source tree.
