# PostHog Integration Design

## Background

The testmail-webviewer project (vanilla JS static site on Cloudflare Pages) already has Sentry for error monitoring. We're adding PostHog for product analytics to understand user behavior.

## Decision: Sentry + PostHog Coexistence

- **Sentry** — error monitoring, crash reporting, performance (keep as-is)
- **PostHog** — product analytics, user behavior tracking (new)

## Architecture

### Approach: Independent analytics.js Module

All PostHog logic lives in a separate `analytics.js` file, keeping it decoupled from business logic in `app.js`.

**Load order in index.html:**
1. PostHog SDK snippet (from CDN or reverse proxy)
2. `analytics.js` (init + tracking functions)
3. `app.js` (calls tracking functions at key points)

### Configuration

- `autocapture: false` — all events are custom
- `$pageview` retained (PostHog default)
- API host points to Cloudflare Workers reverse proxy

## Custom Events

| Event | Trigger | Properties |
|---|---|---|
| `email_fetched` | API fetch success | `email_count`, `has_tag`, `result` |
| `email_fetch_failed` | API fetch failure | `error_message` |
| `email_expanded` | Expand email detail | `email_index`, `has_html`, `has_attachments` |
| `email_collapsed` | Collapse email detail | `email_index` |
| `content_copied` | Copy email content | `copy_type` ("text" / "html") |
| `tab_switched` | Switch HTML/text view | `tab` ("html" / "text") |
| `language_changed` | Toggle language | `from`, `to` |
| `theme_changed` | Select theme | `theme_name` |

## analytics.js Module Structure

```
analytics.js
├── initAnalytics()          // posthog.init() with config
├── trackEmailFetched()      // email_fetched event
├── trackEmailFetchFailed()  // email_fetch_failed event
├── trackEmailExpanded()     // email_expanded event
├── trackEmailCollapsed()    // email_collapsed event
├── trackContentCopied()     // content_copied event
├── trackTabSwitched()       // tab_switched event
├── trackLanguageChanged()   // language_changed event
└── trackThemeChanged()      // theme_changed event
```

All functions exposed on `window` (consistent with app.js pattern).

## Anti-Adblock: Cloudflare Workers Reverse Proxy

Ad blockers block `posthog.com` domains. Solution: route PostHog requests through a Cloudflare Worker on the project's own domain (e.g., `/ingest`).

**Worker responsibilities:**
- Proxy requests from `yourdomain.com/ingest` to `us.posthog.com` (or `eu.posthog.com`)
- Forward headers and body transparently

## File Changes

1. **New: `analytics.js`** — PostHog init + 8 tracking functions
2. **Modified: `index.html`** — add PostHog SDK snippet + `<script src="analytics.js">`
3. **Modified: `app.js`** — call tracking functions at 8 interaction points
4. **New: Cloudflare Worker** — reverse proxy for PostHog API

## API Key Management

PostHog frontend API key is public by design (write-only). Stored directly in `analytics.js`, same approach as Sentry DSN in `index.html`.
