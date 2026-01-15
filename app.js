// Testmail Viewer - 邮件可视化工具

const API_BASE = 'https://api.testmail.app/api/json';

// DOM 元素
const apiKeyInput = document.getElementById('apiKey');
const namespaceInput = document.getElementById('namespace');
const tagInput = document.getElementById('tag');
const fetchBtn = document.getElementById('fetchBtn');
const mailListEl = document.getElementById('mailList');
const mailDetailEl = document.getElementById('mailDetail');
const mailCountEl = document.getElementById('mailCount');
const loadingEl = document.getElementById('loading');

// 状态
let emails = [];
let selectedEmail = null;

// 从 localStorage 加载配置
function loadConfig() {
    const config = localStorage.getItem('testmail-config');
    if (config) {
        const { apiKey, namespace, tag } = JSON.parse(config);
        apiKeyInput.value = apiKey || '';
        namespaceInput.value = namespace || '';
        tagInput.value = tag || '';
    }
}

// 保存配置到 localStorage
function saveConfig() {
    const config = {
        apiKey: apiKeyInput.value,
        namespace: namespaceInput.value,
        tag: tagInput.value
    };
    localStorage.setItem('testmail-config', JSON.stringify(config));
}

// 显示/隐藏加载动画
function showLoading(show) {
    loadingEl.classList.toggle('hidden', !show);
}

// 格式化日期
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
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 获取邮件列表
async function fetchEmails() {
    const apiKey = apiKeyInput.value.trim();
    const namespace = namespaceInput.value.trim();
    const tag = tagInput.value.trim();

    if (!apiKey || !namespace) {
        alert('请填写 API Key 和 Namespace');
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

        if (data.error) {
            throw new Error(data.message || '获取邮件失败');
        }

        emails = data.emails || [];
        renderMailList();

        // 自动选中第一封邮件
        if (emails.length > 0) {
            selectEmail(emails[0]);
        } else {
            mailDetailEl.innerHTML = '<p class="placeholder">没有找到邮件</p>';
        }
    } catch (error) {
        mailListEl.innerHTML = `<div class="error-msg">错误: ${error.message}</div>`;
        mailDetailEl.innerHTML = '<p class="placeholder">获取邮件失败</p>';
    } finally {
        showLoading(false);
    }
}

// 渲染邮件列表
function renderMailList() {
    mailCountEl.textContent = emails.length;

    if (emails.length === 0) {
        mailListEl.innerHTML = '<p class="placeholder">没有找到邮件</p>';
        return;
    }

    mailListEl.innerHTML = emails.map((email, index) => `
        <div class="mail-item ${selectedEmail && selectedEmail.id === email.id ? 'active' : ''}"
             data-index="${index}">
            <div class="from">${escapeHtml(email.from || '未知发件人')}</div>
            <div class="subject">${escapeHtml(email.subject || '(无主题)')}</div>
            <div class="meta">
                <span class="time">${formatDate(email.timestamp)}</span>
                ${email.tag ? `<span class="tag">${escapeHtml(email.tag)}</span>` : ''}
            </div>
        </div>
    `).join('');

    // 绑定点击事件
    mailListEl.querySelectorAll('.mail-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            selectEmail(emails[index]);
        });
    });
}

// 选中邮件
function selectEmail(email) {
    selectedEmail = email;
    renderMailList();
    renderMailDetail(email);
}

// 渲染邮件详情
function renderMailDetail(email) {
    const hasHtml = email.html && email.html.trim();
    const hasText = email.text && email.text.trim();
    const hasAttachments = email.attachments && email.attachments.length > 0;

    let tabsHtml = '';
    if (hasHtml && hasText) {
        tabsHtml = `
            <div class="tabs">
                <button class="tab-btn active" data-tab="html">HTML</button>
                <button class="tab-btn" data-tab="text">纯文本</button>
            </div>
        `;
    }

    let bodyHtml = '';
    if (hasHtml) {
        bodyHtml = `
            <div class="detail-body html-content" id="htmlBody">
                <iframe id="emailFrame" sandbox="allow-same-origin"></iframe>
            </div>
            ${hasText ? `<div class="detail-body text-content" id="textBody" style="display:none;"><pre>${escapeHtml(email.text)}</pre></div>` : ''}
        `;
    } else if (hasText) {
        bodyHtml = `<div class="detail-body"><pre>${escapeHtml(email.text)}</pre></div>`;
    } else {
        bodyHtml = '<div class="detail-body"><p class="placeholder">邮件没有内容</p></div>';
    }

    let attachmentsHtml = '';
    if (hasAttachments) {
        attachmentsHtml = `
            <div class="detail-attachments">
                <h3>附件 (${email.attachments.length})</h3>
                ${email.attachments.map(att => `
                    <div class="attachment-item">
                        <span>📎</span>
                        <span>${escapeHtml(att.filename || '未命名附件')}</span>
                        <span>(${formatFileSize(att.size)})</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    mailDetailEl.innerHTML = `
        <div class="detail-header">
            <div class="subject">${escapeHtml(email.subject || '(无主题)')}</div>
            <div class="meta-row">
                <span class="meta-label">发件人</span>
                <span class="meta-value">${escapeHtml(email.from || '未知')}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">收件人</span>
                <span class="meta-value">${escapeHtml(email.to || '未知')}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">时间</span>
                <span class="meta-value">${new Date(email.timestamp).toLocaleString('zh-CN')}</span>
            </div>
            ${email.tag ? `
            <div class="meta-row">
                <span class="meta-label">标签</span>
                <span class="meta-value"><span class="tag">${escapeHtml(email.tag)}</span></span>
            </div>
            ` : ''}
        </div>
        ${tabsHtml}
        ${bodyHtml}
        ${attachmentsHtml}
    `;

    // 设置 HTML 内容到 iframe
    if (hasHtml) {
        const iframe = document.getElementById('emailFrame');
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(email.html);
        doc.close();

        // 自动调整 iframe 高度
        setTimeout(() => {
            try {
                iframe.style.height = Math.max(400, doc.body.scrollHeight + 40) + 'px';
            } catch (e) {}
        }, 100);
    }

    // 绑定 tab 切换
    if (hasHtml && hasText) {
        mailDetailEl.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                mailDetailEl.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                document.getElementById('htmlBody').style.display = tab === 'html' ? 'block' : 'none';
                document.getElementById('textBody').style.display = tab === 'text' ? 'block' : 'none';
            });
        });
    }
}

// HTML 转义
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (!bytes) return '未知大小';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    fetchBtn.addEventListener('click', fetchEmails);

    // 回车触发获取
    [apiKeyInput, namespaceInput, tagInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                fetchEmails();
            }
        });
    });
});
