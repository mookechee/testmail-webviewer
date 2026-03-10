/**
 * PostHog Analytics Module
 * Custom event tracking for Testmail WebViewer
 */

const POSTHOG_API_KEY = 'YOUR_POSTHOG_API_KEY';
const POSTHOG_HOST = '/ingest';

// Initialize PostHog
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

// Track successful email fetch
function trackEmailFetched(emailCount, hasTag) {
    if (typeof posthog === 'undefined') return;

    posthog.capture('email_fetched', {
        email_count: emailCount,
        has_tag: hasTag
    });
}

// Track failed email fetch
function trackEmailFetchFailed(errorMessage) {
    if (typeof posthog === 'undefined') return;

    posthog.capture('email_fetch_failed', {
        error_message: errorMessage
    });
}

// Track email expanded
function trackEmailExpanded(emailIndex, hasHtml, hasAttachments) {
    if (typeof posthog === 'undefined') return;

    posthog.capture('email_expanded', {
        email_index: emailIndex,
        has_html: hasHtml,
        has_attachments: hasAttachments
    });
}

// Track email collapsed
function trackEmailCollapsed(emailIndex) {
    if (typeof posthog === 'undefined') return;

    posthog.capture('email_collapsed', {
        email_index: emailIndex
    });
}

// Track content copied
function trackContentCopied(copyType) {
    if (typeof posthog === 'undefined') return;

    posthog.capture('content_copied', {
        copy_type: copyType
    });
}

// Track tab switched
function trackTabSwitched(tab) {
    if (typeof posthog === 'undefined') return;

    posthog.capture('tab_switched', {
        tab: tab
    });
}

// Track language changed
function trackLanguageChanged(from, to) {
    if (typeof posthog === 'undefined') return;

    posthog.capture('language_changed', {
        from: from,
        to: to
    });
}

// Track theme changed
function trackThemeChanged(themeName) {
    if (typeof posthog === 'undefined') return;

    posthog.capture('theme_changed', {
        theme_name: themeName
    });
}

// Make functions globally accessible
window.initAnalytics = initAnalytics;
window.trackEmailFetched = trackEmailFetched;
window.trackEmailFetchFailed = trackEmailFetchFailed;
window.trackEmailExpanded = trackEmailExpanded;
window.trackEmailCollapsed = trackEmailCollapsed;
window.trackContentCopied = trackContentCopied;
window.trackTabSwitched = trackTabSwitched;
window.trackLanguageChanged = trackLanguageChanged;
window.trackThemeChanged = trackThemeChanged;
