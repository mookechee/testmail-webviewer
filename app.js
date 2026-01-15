/**
 * Testmail Viewer - Material Design 邮件可视化工具
 * 适配 GitHub Pages 静态部署
 */

const API_BASE = 'https://api.testmail.app/api/json';

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

// State
let emails = [];
let activeEmailIndex = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    bindEvents();
});

// Load config from localStorage
function loadConfig() {
    try {
        const config = localStorage.getItem('testmail-viewer-config');
        if (config) {
            const { apiKey, namespace, tag } = JSON.parse(config);
            if (apiKey) apiKeyInput.value = apiKey;
            if (namespace) namespaceInput.value = namespace;
            if (tag) tagInput.value = tag;
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
            tag: tagInput.value.trim()
        };
        localStorage.setItem('testmail-viewer-config', JSON.stringify(config));
    } catch (e) {
        console.warn('Failed to save config:', e);
    }
}

// Bind events
function bindEvents() {
    fetchBtn.addEventListener('click', fetchEmails);

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

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;

    return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format file size
function formatFileSize(bytes) {
    if (!bytes) return '未知';
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
    if (!from) return { name: '未知发件人', email: '' };

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
    return '(无预览)';
}

// Fetch emails from API
async function fetchEmails() {
    const apiKey = apiKeyInput.value.trim();
    const namespace = namespaceInput.value.trim();
    const tag = tagInput.value.trim();

    if (!apiKey || !namespace) {
        showSnackbar('请填写 API Key 和 Namespace', 'error');
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
            throw new Error(data.message || '获取邮件失败');
        }

        emails = Array.isArray(data.emails) ? data.emails : [];
        activeEmailIndex = null;

        // Update stats
        updateStats(data);

        // Render email list
        renderEmailList();

        if (emails.length === 0) {
            showSnackbar('没有找到邮件', 'default');
        } else {
            showSnackbar(`成功获取 ${emails.length} 封邮件`, 'success');
        }

    } catch (error) {
        console.error('Fetch error:', error);
        showSnackbar(error.message || '请求失败，请检查网络', 'error');
        renderError(error.message);
    } finally {
        showLoading(false);
    }
}

// Update stats chips
function updateStats(data) {
    statsRowEl.innerHTML = `
        <div class="chip">总数: ${data.count || 0}</div>
        <div class="chip">当前: ${emails.length}</div>
        ${data.offset ? `<div class="chip">Offset: ${data.offset}</div>` : ''}
    `;
}

// Render error state
function renderError(message) {
    emailListEl.innerHTML = `
        <div class="error-state">
            <p>错误: ${escapeHtml(message)}</p>
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
                <p>没有找到邮件</p>
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
                        <div class="subject-text">${escapeHtml(email.subject || '(无主题)')}</div>
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
                <span class="info-label">发件人</span>
                <span class="info-value">${escapeHtml(email.from || '未知')}</span>
            </div>
            <div class="info-item full-width">
                <span class="info-label">收件人</span>
                <span class="info-value">${escapeHtml(email.to || '未知')}</span>
            </div>
            <div class="info-item">
                <span class="info-label">时间</span>
                <span class="info-value">${new Date(email.timestamp).toLocaleString('zh-CN')}</span>
            </div>
            ${email.tag ? `
            <div class="info-item">
                <span class="info-label">标签</span>
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
                复制文本
            </button>
            ${hasHtml ? `
            <button class="btn-text" onclick="copyEmailContent(${index}, 'html')">
                ${icons.copy}
                复制HTML
            </button>
            ` : ''}
        </div>
    `;

    // Tabs (if both HTML and text exist)
    if (hasHtml && hasText) {
        html += `
            <div class="tabs">
                <button class="tab-btn active" onclick="switchTab(${index}, 'html')">HTML 视图</button>
                <button class="tab-btn" onclick="switchTab(${index}, 'text')">纯文本</button>
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
        html += `<div class="empty-state"><p>邮件没有内容</p></div>`;
    }

    // Attachments
    if (hasAttachments) {
        html += `
            <div class="attachments-section">
                <div class="attachments-title">附件 (${email.attachments.length})</div>
                ${email.attachments.map(att => `
                    <div class="attachment-item">
                        ${icons.attachment}
                        <span>${escapeHtml(att.filename || '未命名')}</span>
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
        showSnackbar('没有可复制的内容', 'error');
        return;
    }

    try {
        await navigator.clipboard.writeText(content);
        showSnackbar('已复制到剪贴板', 'success');
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
        showSnackbar('已复制到剪贴板', 'success');
    }
}

// Make functions globally accessible
window.toggleEmail = toggleEmail;
window.switchTab = switchTab;
window.copyEmailContent = copyEmailContent;
