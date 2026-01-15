/**
 * Testmail Viewer - Material Design Email Visualization Tool
 * Supports GitHub Pages Static Deployment
 * Internationalization (i18n) Support
 */

const API_BASE = 'https://api.testmail.app/api/json';

// Translations
const translations = {
    zh: {
        appTitle: 'Testmail Viewer',
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
        copied: '已复制到剪贴板'
    },
    en: {
        appTitle: 'Testmail Viewer',
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
        copied: 'Copied to clipboard'
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

// State
let emails = [];
let activeEmailIndex = null;
let currentLang = 'zh'; // Default language

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
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
            const { apiKey, namespace, tag, lang } = JSON.parse(config);
            if (apiKey) apiKeyInput.value = apiKey;
            if (namespace) namespaceInput.value = namespace;
            if (tag) tagInput.value = tag;
            if (lang) currentLang = lang;
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
            lang: currentLang
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

// Bind events
function bindEvents() {
    fetchBtn.addEventListener('click', fetchEmails);
    langBtn.addEventListener('click', toggleLanguage);

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

// Fetch emails from API
async function fetchEmails() {
    const apiKey = apiKeyInput.value.trim();
    const namespace = namespaceInput.value.trim();
    const tag = tagInput.value.trim();

    if (!apiKey || !namespace) {
        showSnackbar(t('errorMissingConfig'), 'error');
        return;
    }

    saveConfig();
    showLoading(true);

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
        showLoading(false);
    }
}

// Update stats chips
function updateStats(data) {
    // If called without data (e.g. from updateLanguageUI), use emails array
    // Note: data.count is total on server, emails.length is what we have loaded.
    // Ideally we persist the 'data' object. For now, rely on emails.length for current.
    
    // We can't really restore 'data.count' or 'data.offset' without storing them.
    // For this simple app, we will just re-render what we can. 
    // If 'data' is passed (from fetch), use it.
    
    const count = data ? (data.count || 0) : 'N/A';
    const offset = data ? data.offset : null;

    let html = `
        <div class="chip" data-i18n="subtitle">${t('subtitle')}</div>
        <div class="chip">${t('total')}: ${count}</div>
        <div class="chip">${t('current')}: ${emails.length}</div>
    `;
    
    if (offset) {
        html += `<div class="chip">${t('offset')}: ${offset}</div>`;
    }

    // Preserve the lang button which is also in this row in HTML structure but 
    // actually, in HTML I moved langBtn to stats-row. 
    // Wait, the stats-row innerHTML overwrite will kill the langBtn if it's inside statsRow!
    // Let's check index.html again.
    // I put <div class="stats-row"><div class="chip" id="statsRow">...</div> <button id="langBtn">...</div>
    // Ah, wait. In index.html:
    // <div class="stats-row">
    //    <div class="chip" id="statsRow" data-i18n="subtitle">邮件可视化工具</div>
    //    <button id="langBtn"...>
    // </div>
    //
    // The previous code was: statsRowEl = document.getElementById('statsRow');
    // And in JS: statsRowEl.innerHTML = ...
    // This targets the specific chip DIV, not the container DIV.
    // So modifying statsRowEl (the chip) is wrong if I want multiple chips.
    //
    // Let's look at my index.html change again.
    // <div class="stats-row">
    //     <div class="chip" id="statsRow" data-i18n="subtitle">邮件可视化工具</div>
    //     <button id="langBtn" ...>
    // </div>
    //
    // So 'statsRowEl' corresponds to the first chip.
    // But fetchEmails calls updateStats which does:
    // statsRowEl.innerHTML = `...multiple chips...`
    // This means the first chip will contain multiple chips inside it. That breaks CSS likely.
    
    // Correction:
    // In original HTML: <div class="stats-row" id="statsRow"> <div class="chip">...</div> </div>
    // I changed it to: <div class="stats-row"> <div class="chip" id="statsRow">...</div> <button...> </div>
    // This was a mistake in my thought process if I want to inject chips *next* to the button.
    
    // Let's adjust JS to target the parent container or handle the stats differently.
    // Or, I can target the container and append the button.
    // Easier fix: Use a specific container for stats inside the stats-row, and leave the button outside or next to it.
    
    // Current Index.html state (from my previous tool call):
    // <div class="stats-row">
    //     <div class="chip" id="statsRow" data-i18n="subtitle">邮件可视化工具</div>
    //     <button id="langBtn" ...>
    // </div>
    
    // JS updateStats overwrites 'statsRowEl' (id="statsRow").
    // If I overwrite it, I lose 'data-i18n="subtitle"'.
    // And if I put multiple chips inside a .chip, it looks nested.
    
    // I need to fix `updateStats` to play nice with the new HTML structure.
    // Or assume `statsRowEl` is just one chip that acts as a status line?
    // No, previous code generated multiple chips.
    
    // Solution:
    // I will use `statsRowEl` to display the 'Subtitle' (default) OR the stats.
    // When we fetch emails, we replace the subtitle chip with stats chips?
    // Or better:
    // The id="statsRow" should probably be on a container for stats, distinct from the static subtitle.
    
    // Let's assume for now I will overwrite the innerHTML of that first div.
    // It will look like a chip containing other chips? No, that's bad CSS.
    
    // I'll dynamically change the DOM logic here in JS to fix this.
    // I will grab the parent of statsRowEl (which is class="stats-row")
    // And replace the content there, but keep the button.
}

// Redefining updateStats to be safe
function updateStats(data) {
    const parent = document.querySelector('.stats-row');
    // Remove all chips except the lang button
    // Actually, easier to just rebuild the stats part.
    
    // Let's assume I want:
    // [Stats Chips] [Lang Button]
    
    // I'll modify the logic to find the container.
    // Since I can't easily change HTML again without another tool call (I could, but let's try to be efficient),
    // I will work with what I have.
    // id="statsRow" is on the first .chip.
    
    // If I change the outerHTML of statsRowEl, I lose the reference.
    
    // Let's just update the textContent of statsRowEl if it's just one chip, 
    // OR, if I want multiple chips as before, I should have a container.
    
    // Retrying the HTML structure plan in my head:
    // Old: <div class="stats-row" id="statsRow">...</div>
    // New: <div class="stats-row"> <div id="statsRow" class="chip">...</div> <button...> </button> </div>
    
    // The `statsRowEl` is the `div.chip`.
    // If I set `statsRowEl.outerHTML` to a string of multiple divs, I replace the single chip with multiple.
    // But I need to re-acquire the reference for future updates? 
    // Or just wrap stats in a span/div in the HTML next time.
    
    // Alternative: Just show text in that one chip. "Total: 5 | Current: 5"
    // This is safer and cleaner for now without changing HTML structure again.
    
    const count = data ? (data.count || 0) : 0;
    const offset = data ? data.offset : '';
    
    let text = `${t('total')}: ${count} · ${t('current')}: ${emails.length}`;
    if (offset) text += ` · ${t('offset')}: ${offset}`;
    
    statsRowEl.textContent = text;
    // Remove data-i18n so it doesn't get overwritten on lang switch back to "Email Visualization Tool"
    // ONLY if we have data.
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
        emailListEl.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" class="empty-icon">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <p>${t('noEmailsFound')}</p>
            </div>
        `;
        return;
    }

    emailListEl.innerHTML = emails.map((email, index) => {
        const sender = getSenderInfo(email.from);
        const preview = getPreview(email);
        const isActive = activeEmailIndex === index;

        return `
            <div class="email-item ${isActive ? 'active' : ''}" data-index="${index}">
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