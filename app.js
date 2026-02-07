/**
 * Testmail WebViewer - Material Design Email Visualization Tool
 * Supports GitHub Pages Static Deployment
 * Internationalization (i18n) Support
 */

const API_BASE = 'https://api.testmail.app/api/json';

// Translations
const translations = {
    zh: {
        appTitle: 'Testmail WebViewer',
        subtitle: '邮件可视化工具',
        configTitle: 'API 配置',
        apiKeyLabel: 'API Key',
        apiKeyPlaceholder: '输入你的 Testmail API Key',
        namespaceLabel: 'Namespace',
        namespacePlaceholder: '输入你的 Namespace',
        tagLabel: 'Tag (可选)',
        tagPlaceholder: '筛选特定标签',
        fetchBtn: '获取邮件',
        emptyState: '请先配置 API 并获取邮件',
        emptyHint: '在上方填写 API Key 和 Namespace 后点击获取',
        loading: '加载中...',
        justNow: '刚刚',
        minsAgo: '分钟前',
        hoursAgo: '小时前',
        daysAgo: '天前',
        unknownSize: '未知',
        unknownSender: '未知发件人',
        noPreview: '(无预览)',
        errorMissingConfig: '请填写 API Key 和 Namespace',
        errorFetch: '获取邮件失败',
        noEmailsFound: '没有找到邮件',
        noEmailsHint: '尝试更换 Tag 或检查 Namespace',
        successFetch: '成功获取 {n} 封邮件',
        networkError: '请求失败，请检查网络',
        total: '总数',
        current: '当前',
        offset: 'Offset',
        errorLabel: '错误',
        noSubject: '(无主题)',
        senderLabel: '发件人',
        recipientLabel: '收件人',
        timeLabel: '时间',
        tagLabelInfo: '标签',
        unknown: '未知',
        copyText: '复制文本',
        copyHtml: '复制HTML',
        htmlView: 'HTML 视图',
        textView: '纯文本',
        noContent: '邮件没有内容',
        attachments: '附件',
        unnamed: '未命名',
        noContentCopy: '没有可复制的内容',
        copied: '已复制到剪贴板',
        helpTooltip: '查看使用帮助'
    },
    en: {
        appTitle: 'Testmail WebViewer',
        subtitle: 'Email Visualization Tool',
        configTitle: 'API Configuration',
        apiKeyLabel: 'API Key',
        apiKeyPlaceholder: 'Enter your Testmail API Key',
        namespaceLabel: 'Namespace',
        namespacePlaceholder: 'Enter your Namespace',
        tagLabel: 'Tag (Optional)',
        tagPlaceholder: 'Filter by specific tag',
        fetchBtn: 'Fetch Emails',
        emptyState: 'Please configure API and fetch emails',
        emptyHint: 'Fill in API Key and Namespace above, then click Fetch',
        loading: 'Loading...',
        justNow: 'Just now',
        minsAgo: 'mins ago',
        hoursAgo: 'hours ago',
        daysAgo: 'days ago',
        unknownSize: 'Unknown',
        unknownSender: 'Unknown Sender',
        noPreview: '(No Preview)',
        errorMissingConfig: 'Please enter API Key and Namespace',
        errorFetch: 'Failed to fetch emails',
        noEmailsFound: 'No emails found',
        noEmailsHint: 'Try a different Tag or check Namespace',
        successFetch: 'Successfully fetched {n} emails',
        networkError: 'Request failed, check network',
        total: 'Total',
        current: 'Current',
        offset: 'Offset',
        errorLabel: 'Error',
        noSubject: '(No Subject)',
        senderLabel: 'Sender',
        recipientLabel: 'Recipient',
        timeLabel: 'Time',
        tagLabelInfo: 'Tag',
        unknown: 'Unknown',
        copyText: 'Copy Text',
        copyHtml: 'Copy HTML',
        htmlView: 'HTML View',
        textView: 'Plain Text',
        noContent: 'Email has no content',
        attachments: 'Attachments',
        unnamed: 'Unnamed',
        noContentCopy: 'No content to copy',
        copied: 'Copied to clipboard',
        helpTooltip: 'View Help Guide'
    }
};

// SVG Icons
const icons = {
    chevron: '<svg viewBox="0 0 24 24" class="chevron"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" class="icon-sm"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
    attachment: '<svg viewBox="0 0 24 24" class="icon-sm"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>'
};

// DOM Elements
const apiKeyInput = document.getElementById('apiKey');
const namespaceInput = document.getElementById('namespace');
const tagInput = document.getElementById('tag');
const fetchBtn = document.getElementById('fetchBtn');
const emailListEl = document.getElementById('emailList');
const statsRowEl = document.getElementById('statsRow');
const loadingEl = document.getElementById('loading');
const snackbarEl = document.getElementById('snackbar');
const langBtn = document.getElementById('langBtn');
const helpLink = document.getElementById('helpLink');
const themeBtn = document.getElementById('themeBtn');
const themeDropdown = document.getElementById('themeDropdown');

// Help link URLs for different languages
const helpUrls = {
    zh: 'https://github.com/mookechee/testmail-webviewer/blob/main/README.zh.md#-使用指南',
    en: 'https://github.com/mookechee/testmail-webviewer/blob/main/README.md#-usage-guide'
};

// State
let emails = [];
let activeEmailIndex = null;
let currentLang = 'zh'; // Default language
let currentTheme = 'indigo'; // Default theme
let isFetching = false; // Prevent duplicate requests
let hasFetched = false; // Track if user has fetched at least once

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    applyTheme();
    updateLanguageUI();
    bindEvents();
});

// Helper: Get translation
function t(key, params = {}) {
    let text = translations[currentLang][key] || key;
    for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, v);
    }
    return text;
}

// Load config from localStorage
function loadConfig() {
    try {
        const config = localStorage.getItem('testmail-webviewer-config');
        if (config) {
            const { apiKey, namespace, tag, lang, theme } = JSON.parse(config);
            if (apiKey) apiKeyInput.value = apiKey;
            if (namespace) namespaceInput.value = namespace;
            if (tag) tagInput.value = tag;
            if (lang) currentLang = lang;
            if (theme) currentTheme = theme;
        }
    } catch (e) {
        console.warn('Failed to load config:', e);
    }
}

// Save config to localStorage
function saveConfig() {
    try {
        const config = {
            apiKey: apiKeyInput.value.trim(),
            namespace: namespaceInput.value.trim(),
            tag: tagInput.value.trim(),
            lang: currentLang,
            theme: currentTheme
        };
        localStorage.setItem('testmail-webviewer-config', JSON.stringify(config));
    } catch (e) {
        console.warn('Failed to save config:', e);
    }
}

// Update UI Text based on language
function updateLanguageUI() {
    document.documentElement.lang = currentLang;
    langBtn.textContent = currentLang === 'zh' ? 'EN' : '中';
    
    // Update static elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) {
            el.placeholder = translations[currentLang][key];
        }
    });

    // Update title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (translations[currentLang][key]) {
            el.title = translations[currentLang][key];
        }
    });

    // Update help link URL based on language
    if (helpLink && helpUrls[currentLang]) {
        helpLink.href = helpUrls[currentLang];
    }

    // Re-render email list if exists
    if (emails.length > 0) {
        renderEmailList();
        // We can't easily retrieve the full stats object again without storing it, 
        // but we can update the basic counts.
        // ideally updateStats should be called with stored data. 
        // For simplicity, we just update the list text.
    } else {
         // Reset empty state text
         renderEmailList(); 
    }
}

// Toggle Language
function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    saveConfig();
    updateLanguageUI();
}

// Apply theme
function applyTheme() {
    if (currentTheme === 'violet') {
        document.documentElement.setAttribute('data-theme', 'violet');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    // Update active state on theme options
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.toggle('active', opt.getAttribute('data-theme') === currentTheme);
    });

    // Update meta theme-color
    const themeColors = {
        indigo: { light: '#6366F1', dark: '#0F172A' },
        violet: { light: '#7C3AED', dark: '#0F172A' }
    };
    const colors = themeColors[currentTheme] || themeColors.indigo;
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => {
        if (m.media && m.media.includes('light')) {
            m.content = colors.light;
        } else if (m.media && m.media.includes('dark')) {
            m.content = colors.dark;
        }
    });
}

// Toggle theme dropdown
function toggleThemeDropdown() {
    themeDropdown.classList.toggle('open');
}

// Select theme
function selectTheme(themeName) {
    currentTheme = themeName;
    applyTheme();
    saveConfig();
    themeDropdown.classList.remove('open');
}

// Bind events
function bindEvents() {
    fetchBtn.addEventListener('click', fetchEmails);
    langBtn.addEventListener('click', toggleLanguage);
    if (themeBtn) themeBtn.addEventListener('click', toggleThemeDropdown);

    // Theme option clicks
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.addEventListener('click', () => selectTheme(opt.getAttribute('data-theme')));
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.theme-selector')) {
            themeDropdown.classList.remove('open');
        }
    });

    // Enter key triggers fetch
    [apiKeyInput, namespaceInput, tagInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') fetchEmails();
        });
    });
}

// Show/hide loading
function showLoading(show) {
    loadingEl.classList.toggle('hidden', !show);
}

// Show snackbar notification
function showSnackbar(message, type = 'default') {
    snackbarEl.textContent = message;
    snackbarEl.className = 'show';
    if (type === 'error') snackbarEl.classList.add('error');
    if (type === 'success') snackbarEl.classList.add('success');

    setTimeout(() => {
        snackbarEl.className = '';
    }, 3000);
}

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return `${diffMins} ${t('minsAgo')}`;
    if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;
    if (diffDays < 7) return `${diffDays} ${t('daysAgo')}`;

    return date.toLocaleDateString(currentLang === 'zh' ? 'zh-CN' : 'en-US', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format file size
function formatFileSize(bytes) {
    if (!bytes) return t('unknownSize');
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Get avatar letter from email/name
function getAvatarLetter(from) {
    if (!from) return '?';
    const name = from.split('<')[0].replace(/["']/g, '').trim();
    if (name) {
        // Check if first char is Chinese
        if (/[\u4e00-\u9fa5]/.test(name[0])) {
            return name[0];
        }
        return name[0].toUpperCase();
    }
    return '?';
}

// Extract sender info
function getSenderInfo(from) {
    if (!from) return { name: t('unknownSender'), email: '' };

    const match = from.match(/^(.+?)\s*<(.+)>$/);
    if (match) {
        return {
            name: match[1].replace(/["']/g, '').trim() || match[2],
            email: match[2]
        };
    }
    return { name: from, email: from };
}

// Get text preview
function getPreview(email) {
    if (email.text) {
        return email.text.substring(0, 100).replace(/\s+/g, ' ').trim();
    }
    return t('noPreview');
}

// Render skeleton loading screen
function renderSkeleton() {
    const skeletonCount = 4;
    let html = '<div class="skeleton-list">';
    for (let i = 0; i < skeletonCount; i++) {
        html += `
            <div class="skeleton-item" style="animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s both;">
                <div class="skeleton-avatar shimmer"></div>
                <div class="skeleton-content">
                    <div class="skeleton-line short shimmer"></div>
                    <div class="skeleton-line medium shimmer"></div>
                    <div class="skeleton-line long shimmer"></div>
                </div>
                <div class="skeleton-meta">
                    <div class="skeleton-badge shimmer"></div>
                </div>
            </div>
        `;
    }
    html += '</div>';
    emailListEl.innerHTML = html;
}

// Fetch emails from API
async function fetchEmails() {
    // Prevent duplicate requests
    if (isFetching) return;

    const apiKey = apiKeyInput.value.trim();
    const namespace = namespaceInput.value.trim();
    const tag = tagInput.value.trim();

    if (!apiKey || !namespace) {
        showSnackbar(t('errorMissingConfig'), 'error');
        return;
    }

    isFetching = true;
    hasFetched = true;
    saveConfig();
    renderSkeleton();

    try {
        let url = `${API_BASE}?apikey=${encodeURIComponent(apiKey)}&namespace=${encodeURIComponent(namespace)}`;
        if (tag) {
            url += `&tag=${encodeURIComponent(tag)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.result !== 'success') {
            throw new Error(data.message || t('errorFetch'));
        }

        emails = Array.isArray(data.emails) ? data.emails : [];
        activeEmailIndex = null;

        // Update stats
        updateStats(data);

        // Render email list
        renderEmailList();

        if (emails.length === 0) {
            showSnackbar(t('noEmailsFound'), 'default');
        } else {
            showSnackbar(t('successFetch', { n: emails.length }), 'success');
        }

    } catch (error) {
        console.error('Fetch error:', error);
        showSnackbar(error.message || t('networkError'), 'error');
        renderError(error.message);
    } finally {
        isFetching = false;
    }
}

// Update stats chips
function updateStats(data) {
    const count = data ? (data.count || 0) : 0;
    const offset = data ? data.offset : '';

    let text = `${t('total')}: ${count} · ${t('current')}: ${emails.length}`;
    if (offset) text += ` · ${t('offset')}: ${offset}`;

    statsRowEl.textContent = text;
    // Remove data-i18n so it doesn't get overwritten on lang switch
    if (data) {
        statsRowEl.removeAttribute('data-i18n');
    }
}

// Render error state
function renderError(message) {
    emailListEl.innerHTML = `
        <div class="error-state">
            <p>${t('errorLabel')}: ${escapeHtml(message)}</p>
        </div>
    `;
}

// Render email list
function renderEmailList() {
    if (emails.length === 0) {
        const msgKey = hasFetched ? 'noEmailsFound' : 'emptyState';
        const hintKey = hasFetched ? 'noEmailsHint' : 'emptyHint';
        emailListEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-illustration">
                    <div class="empty-envelope"></div>
                    <div class="empty-star"></div>
                    <div class="empty-star"></div>
                    <div class="empty-star"></div>
                </div>
                <p>${t(msgKey)}</p>
                <span class="empty-hint">${t(hintKey)}</span>
            </div>
        `;
        return;
    }

    emailListEl.innerHTML = emails.map((email, index) => {
        const sender = getSenderInfo(email.from);
        const preview = getPreview(email);
        const isActive = activeEmailIndex === index;
        const delay = Math.min(index * 0.05, 0.5);

        return `
            <div class="email-item ${isActive ? 'active' : ''}" data-index="${index}" style="animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1) ${delay}s both;">
                <div class="email-summary" onclick="toggleEmail(${index})">
                    <div class="avatar">${escapeHtml(getAvatarLetter(email.from))}</div>
                    <div class="content-col">
                        <div class="sender-row">
                            <span class="sender-name">${escapeHtml(sender.name)}</span>
                            <span class="sender-email">&lt;${escapeHtml(sender.email)}&gt;</span>
                        </div>
                        <div class="subject-text">${escapeHtml(email.subject || t('noSubject'))}</div>
                        <div class="preview-text">${escapeHtml(preview)}</div>
                    </div>
                    <div class="meta-col">
                        <span class="date-badge">${formatDate(email.timestamp)}</span>
                        ${email.tag ? `<span class="tag-badge">${escapeHtml(email.tag)}</span>` : ''}
                        ${icons.chevron}
                    </div>
                </div>
                <div class="email-detail-container" id="detail-${index}">
                    <div class="email-detail-inner">
                        ${renderEmailDetail(email, index)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Render email detail content
function renderEmailDetail(email, index) {
    const sender = getSenderInfo(email.from);
    const hasHtml = email.html && email.html.trim();
    const hasText = email.text && email.text.trim();
    const hasAttachments = email.attachments && email.attachments.length > 0;

    // Info card
    let html = `
        <div class="info-card">
            <div class="info-item full-width">
                <span class="info-label">${t('senderLabel')}</span>
                <span class="info-value">${escapeHtml(email.from || t('unknown'))}</span>
            </div>
            <div class="info-item full-width">
                <span class="info-label">${t('recipientLabel')}</span>
                <span class="info-value">${escapeHtml(email.to || t('unknown'))}</span>
            </div>
            <div class="info-item">
                <span class="info-label">${t('timeLabel')}</span>
                <span class="info-value">${new Date(email.timestamp).toLocaleString(currentLang === 'zh' ? 'zh-CN' : 'en-US')}</span>
            </div>
            ${email.tag ? `
            <div class="info-item">
                <span class="info-label">${t('tagLabelInfo')}</span>
                <span class="info-value">${escapeHtml(email.tag)}</span>
            </div>
            ` : ''}
        </div>
    `;

    // Action bar
    html += `
        <div class="action-bar">
            <button class="btn-text" onclick="copyEmailContent(${index}, 'text')">
                ${icons.copy}
                ${t('copyText')}
            </button>
            ${hasHtml ? `
            <button class="btn-text" onclick="copyEmailContent(${index}, 'html')">
                ${icons.copy}
                ${t('copyHtml')}
            </button>
            ` : ''}
        </div>
    `;

    // Tabs (if both HTML and text exist)
    if (hasHtml && hasText) {
        html += `
            <div class="tabs">
                <button class="tab-btn active" onclick="switchTab(${index}, 'html')">${t('htmlView')}</button>
                <button class="tab-btn" onclick="switchTab(${index}, 'text')">${t('textView')}</button>
            </div>
        `;
    }

    // Content
    if (hasHtml) {
        html += `
            <div class="iframe-wrapper" id="html-view-${index}">
                <iframe id="iframe-${index}" sandbox="allow-same-origin"></iframe>
            </div>
        `;
        if (hasText) {
            html += `
                <div class="text-content" id="text-view-${index}" style="display: none;">
                    ${escapeHtml(email.text)}
                </div>
            `;
        }
    } else if (hasText) {
        html += `
            <div class="text-content">
                ${escapeHtml(email.text)}
            </div>
        `;
    } else {
        html += `<div class="empty-state"><p>${t('noContent')}</p></div>`;
    }

    // Attachments
    if (hasAttachments) {
        html += `
            <div class="attachments-section">
                <div class="attachments-title">${t('attachments')} (${email.attachments.length})</div>
                ${email.attachments.map(att => `
                    <div class="attachment-item">
                        ${icons.attachment}
                        <span>${escapeHtml(att.filename || t('unnamed'))}</span>
                        <span>(${formatFileSize(att.size)})</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    return html;
}

// Toggle email expand/collapse
function toggleEmail(index) {
    const items = document.querySelectorAll('.email-item');
    const detailContainer = document.getElementById(`detail-${index}`);
    const item = items[index];

    if (activeEmailIndex === index) {
        // Collapse
        item.classList.remove('active');
        detailContainer.style.maxHeight = '0';
        activeEmailIndex = null;
    } else {
        // Collapse previous
        if (activeEmailIndex !== null) {
            items[activeEmailIndex].classList.remove('active');
            document.getElementById(`detail-${activeEmailIndex}`).style.maxHeight = '0';
        }

        // Expand current
        item.classList.add('active');
        detailContainer.style.maxHeight = detailContainer.scrollHeight + 500 + 'px';
        activeEmailIndex = index;

        // Load iframe content
        const email = emails[index];
        if (email.html) {
            setTimeout(() => {
                const iframe = document.getElementById(`iframe-${index}`);
                if (iframe) {
                    const doc = iframe.contentDocument || iframe.contentWindow.document;
                    doc.open();
                    doc.write(email.html);
                    doc.close();

                    // Auto adjust iframe height
                    setTimeout(() => {
                        try {
                            const height = Math.max(350, doc.body.scrollHeight + 40);
                            iframe.style.height = height + 'px';
                        } catch (e) {}
                    }, 100);
                }
            }, 50);
        }
    }
}

// Switch tab between HTML and text view
function switchTab(index, tab) {
    const htmlView = document.getElementById(`html-view-${index}`);
    const textView = document.getElementById(`text-view-${index}`);
    const detailContainer = document.getElementById(`detail-${index}`);
    const tabs = detailContainer.querySelectorAll('.tab-btn');

    tabs.forEach((t, i) => {
        t.classList.toggle('active', (tab === 'html' && i === 0) || (tab === 'text' && i === 1));
    });

    if (htmlView) htmlView.style.display = tab === 'html' ? 'block' : 'none';
    if (textView) textView.style.display = tab === 'text' ? 'block' : 'none';
}

// Copy email content to clipboard
async function copyEmailContent(index, type) {
    const email = emails[index];
    let content = '';

    if (type === 'html' && email.html) {
        content = email.html;
    } else if (email.text) {
        content = email.text;
    } else {
        showSnackbar(t('noContentCopy'), 'error');
        return;
    }

    try {
        await navigator.clipboard.writeText(content);
        showSnackbar(t('copied'), 'success');
    } catch (e) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showSnackbar(t('copied'), 'success');
    }
}

// Make functions globally accessible
window.toggleEmail = toggleEmail;
window.switchTab = switchTab;
window.copyEmailContent = copyEmailContent;