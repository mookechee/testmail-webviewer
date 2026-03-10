# PostHog Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add PostHog product analytics with 8 custom events and a Cloudflare Workers reverse proxy for anti-adblock.

**Architecture:** Independent `analytics.js` module with all PostHog logic, loaded between PostHog SDK and `app.js`. Cloudflare Pages Functions as reverse proxy to avoid ad blocker detection.

**Tech Stack:** PostHog JS SDK (CDN), Cloudflare Pages Functions

---

### Task 1: Create analytics.js with PostHog init and all tracking functions

**Files:**
- Create: `analytics.js`

**Step 1: Create analytics.js with init and 8 tracking functions**

```javascript
/**
 * PostHog Analytics Module
 * All tracking logic centralized here, called from app.js
 */

const POSTHOG_API_KEY = 'YOUR_POSTHOG_API_KEY'; // TODO: Replace with actual key
const POSTHOG_HOST = '/ingest'; // Cloudflare Workers reverse proxy

function initAnalytics() {
    if (typeof posthog === 'undefined') return;
    posthog.init(POSTHOG_API_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: false,
        capture_pageview: true,
        capture_pageleave: true,
        persistence: 'localStorage'
    });
}

function trackEmailFetched(emailCount, hasTag) {
    if (typeof posthog === 'undefined') return;
    posthog.capture('email_fetched', {
        email_count: emailCount,
        has_tag: hasTag
    });
}

function trackEmailFetchFailed(errorMessage) {
    if (typeof posthog === 'undefined') return;
    posthog.capture('email_fetch_failed', {
        error_message: errorMessage
    });
}

function trackEmailExpanded(emailIndex, hasHtml, hasAttachments) {
    if (typeof posthog === 'undefined') return;
    posthog.capture('email_expanded', {
        email_index: emailIndex,
        has_html: hasHtml,
        has_attachments: hasAttachments
    });
}

function trackEmailCollapsed(emailIndex) {
    if (typeof posthog === 'undefined') return;
    posthog.capture('email_collapsed', {
        email_index: emailIndex
    });
}

function trackContentCopied(copyType) {
    if (typeof posthog === 'undefined') return;
    posthog.capture('content_copied', {
        copy_type: copyType
    });
}

function trackTabSwitched(tab) {
    if (typeof posthog === 'undefined') return;
    posthog.capture('tab_switched', { tab: tab });
}

function trackLanguageChanged(from, to) {
    if (typeof posthog === 'undefined') return;
    posthog.capture('language_changed', { from: from, to: to });
}

function trackThemeChanged(themeName) {
    if (typeof posthog === 'undefined') return;
    posthog.capture('theme_changed', { theme_name: themeName });
}

// Expose globally (consistent with app.js pattern)
window.initAnalytics = initAnalytics;
window.trackEmailFetched = trackEmailFetched;
window.trackEmailFetchFailed = trackEmailFetchFailed;
window.trackEmailExpanded = trackEmailExpanded;
window.trackEmailCollapsed = trackEmailCollapsed;
window.trackContentCopied = trackContentCopied;
window.trackTabSwitched = trackTabSwitched;
window.trackLanguageChanged = trackLanguageChanged;
window.trackThemeChanged = trackThemeChanged;
```

**Step 2: Verify file created**

Run: `ls -la analytics.js`
Expected: File exists

**Step 3: Commit**

```bash
git add analytics.js
git commit -m "feat(analytics): add PostHog analytics module with 8 custom events"
```

---

### Task 2: Add PostHog SDK and analytics.js to index.html

**Files:**
- Modify: `index.html:85-86` (after Sentry closing script tag, before `</head>`)
- Modify: `index.html:199` (before `app.js` script tag)

**Step 1: Add PostHog SDK snippet after Sentry block (line 85)**

Insert after line 85 (`</script>` closing Sentry):

```html
    <!-- PostHog SDK -->
    <script>
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing identify alias people.set people.set_once set_config reset get_config get_property getFeatureFlag getFeatureFlagPayload isFeatureEnabled onFeatureFlags getUserId setPersonProperties getGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId setBootstrapFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    </script>
```

**Step 2: Add analytics.js script tag before app.js (line 199)**

Insert before `<script src="app.js"></script>`:

```html
    <script src="analytics.js"></script>
```

**Step 3: Verify load order in index.html**

Run: `grep -n 'script.*src\|script>' index.html | head -20`
Expected: PostHog SDK → analytics.js → app.js

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat(analytics): load PostHog SDK and analytics.js in index.html"
```

---

### Task 3: Add tracking calls in app.js

**Files:**
- Modify: `app.js:242-246` (toggleLanguage)
- Modify: `app.js:282-287` (selectTheme)
- Modify: `app.js:144-150` (DOMContentLoaded — init)
- Modify: `app.js:461-474` (fetchEmails success)
- Modify: `app.js:476-479` (fetchEmails error)
- Modify: `app.js:669-673` (toggleEmail collapse)
- Modify: `app.js:681-684` (toggleEmail expand)
- Modify: `app.js:711-722` (switchTab)
- Modify: `app.js:739-753` (copyEmailContent)

**Step 1: Add initAnalytics() call in DOMContentLoaded**

In `app.js:144-150`, add `initAnalytics()` after `loadConfig()`:

```javascript
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    initAnalytics();  // <-- ADD THIS LINE
    applyTheme();
    updateLanguageUI();
    bindEvents();
});
```

**Step 2: Add trackLanguageChanged() in toggleLanguage**

In `app.js:242-246`:

```javascript
function toggleLanguage() {
    const prevLang = currentLang;  // <-- ADD
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    trackLanguageChanged(prevLang, currentLang);  // <-- ADD
    saveConfig();
    updateLanguageUI();
}
```

**Step 3: Add trackThemeChanged() in selectTheme**

In `app.js:282-287`:

```javascript
function selectTheme(themeName) {
    currentTheme = themeName;
    trackThemeChanged(themeName);  // <-- ADD
    applyTheme();
    saveConfig();
    themeDropdown.classList.remove('open');
}
```

**Step 4: Add trackEmailFetched() after successful fetch**

In `app.js:468`, after `renderEmailList()`:

```javascript
        renderEmailList();
        trackEmailFetched(emails.length, !!tag);  // <-- ADD

        if (emails.length === 0) {
```

**Step 5: Add trackEmailFetchFailed() in catch block**

In `app.js:476-479`:

```javascript
    } catch (error) {
        console.error('Fetch error:', error);
        trackEmailFetchFailed(error.message || 'unknown');  // <-- ADD
        showSnackbar(error.message || t('networkError'), 'error');
```

**Step 6: Add trackEmailCollapsed() and trackEmailExpanded() in toggleEmail**

In `app.js:664-707`:

```javascript
    if (activeEmailIndex === index) {
        // Collapse
        item.classList.remove('active');
        detailContainer.style.maxHeight = '0';
        trackEmailCollapsed(index);  // <-- ADD
        activeEmailIndex = null;
    } else {
        // ... collapse previous ...

        // Expand current
        item.classList.add('active');
        detailContainer.style.maxHeight = detailContainer.scrollHeight + 500 + 'px';
        activeEmailIndex = index;

        const email = emails[index];  // <-- MOVE UP (already exists at line 687)
        trackEmailExpanded(index, !!email.html, !!(email.attachments && email.attachments.length));  // <-- ADD
```

**Step 7: Add trackTabSwitched() in switchTab**

In `app.js:711-722`, add at end of function:

```javascript
function switchTab(index, tab) {
    // ... existing code ...
    if (htmlView) htmlView.style.display = tab === 'html' ? 'block' : 'none';
    if (textView) textView.style.display = tab === 'text' ? 'block' : 'none';
    trackTabSwitched(tab);  // <-- ADD
}
```

**Step 8: Add trackContentCopied() in copyEmailContent**

In `app.js:741` and `app.js:752`, after each successful copy:

```javascript
    try {
        await navigator.clipboard.writeText(content);
        trackContentCopied(type);  // <-- ADD
        showSnackbar(t('copied'), 'success');
    } catch (e) {
        // Fallback
        // ...
        document.execCommand('copy');
        document.body.removeChild(textarea);
        trackContentCopied(type);  // <-- ADD
        showSnackbar(t('copied'), 'success');
    }
```

**Step 9: Verify no syntax errors**

Open `index.html` in browser, check console for JS errors.
Expected: No errors, page loads normally.

**Step 10: Commit**

```bash
git add app.js
git commit -m "feat(analytics): add PostHog tracking calls to all user interactions"
```

---

### Task 4: Create Cloudflare Pages Function for PostHog reverse proxy

**Files:**
- Create: `functions/ingest/[[path]].js`

**Step 1: Create the catch-all proxy function**

```javascript
export async function onRequest(context) {
    const url = new URL(context.request.url);
    const pathname = url.pathname.replace(/^\/ingest/, '');
    const search = url.search;

    const posthogUrl = `https://us.posthog.com${pathname}${search}`;

    const headers = new Headers(context.request.headers);
    headers.set('host', 'us.posthog.com');

    const response = await fetch(posthogUrl, {
        method: context.request.method,
        headers: headers,
        body: context.request.method === 'GET' ? undefined : context.request.body
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
        status: response.status,
        headers: responseHeaders
    });
}
```

> **Note:** If your PostHog project is in the EU region, change `us.posthog.com` to `eu.posthog.com`.

**Step 2: Verify directory structure**

Run: `ls -la functions/ingest/`
Expected: `[[path]].js` exists

**Step 3: Commit**

```bash
git add functions/
git commit -m "feat(analytics): add Cloudflare Pages Function as PostHog reverse proxy"
```

---

### Task 5: Replace placeholder API key and verify end-to-end

**Files:**
- Modify: `analytics.js:7` (replace `YOUR_POSTHOG_API_KEY`)

**Step 1: Replace API key placeholder**

In `analytics.js`, replace `YOUR_POSTHOG_API_KEY` with the actual PostHog project API key.

> **Action required:** User must provide their PostHog project API key. Find it at PostHog → Project Settings → Project API Key.

**Step 2: Verify locally**

Open `index.html` in browser:
1. Open DevTools → Network tab
2. Filter by "posthog" or "ingest"
3. Check that PostHog init fires (you'll see requests to `/ingest/...`)
4. Perform actions (fetch email, expand, copy, switch tab/lang/theme)
5. Verify events appear in Network tab as POST requests

> **Note:** The `/ingest` proxy won't work locally (no Cloudflare Worker). For local testing, temporarily change `POSTHOG_HOST` to `https://us.posthog.com` (or `eu.posthog.com`), verify events appear in PostHog dashboard, then change back before committing.

**Step 3: Commit with real API key**

```bash
git add analytics.js
git commit -m "feat(analytics): configure PostHog API key"
```

---

### Task 6: Deploy and verify on Cloudflare Pages

**Step 1: Push to trigger Cloudflare Pages build**

```bash
git push origin main
```

**Step 2: Verify deployment**

1. Wait for Cloudflare Pages build to complete
2. Visit the deployed site
3. Open DevTools → Network tab
4. Verify PostHog requests go to `yourdomain.com/ingest/...` (not `posthog.com`)
5. Perform all 8 tracked actions
6. Check PostHog dashboard → Events to confirm events arrive

**Step 3: Test with ad blocker enabled**

1. Enable uBlock Origin or similar
2. Repeat the actions
3. Verify events still reach PostHog (via the reverse proxy)
