// ==========================================
// 1. 数据解析与测试层
// ==========================================
let responseJson = {};
try {
    responseJson = pm.response.json();
} catch (e) {
    console.error("JSON解析失败", e);
    responseJson = { result: "fail", message: "非JSON响应" };
}

// 基础断言
pm.test("API响应状态 OK", function () {
    pm.expect(responseJson).to.be.an('object');
    pm.expect(responseJson.result).to.eql("success");
});

if (responseJson.result === "success") {
    pm.test("数据结构验证", function () {
        if (!Array.isArray(responseJson.emails)) responseJson.emails = [];
    });
}

// ==========================================
// 2. Material Design 可视化层
// ==========================================

const emails = Array.isArray(responseJson.emails) ? responseJson.emails : [];

if (responseJson.result === "success" && emails.length > 0) {
    
    // 【核心修复】防止 JSON 中的特殊字符破坏 HTML 结构
    // 同时也处理了可能存在的反斜杠问题
    const safeEmailsData = JSON.stringify(emails).split('</script>').join('<\/script>');
    
    const icons = {
        expand: '<svg viewBox="0 0 24 24" class="icon chevron"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>',
        copy: '<svg viewBox="0 0 24 24" class="icon-sm"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
        email: '<svg viewBox="0 0 24 24" class="icon-hero"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>'
    };

    let html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Material Email Client</title>
        <style>
            :root {
                --md-sys-color-primary: #3F51B5;
                --md-sys-color-on-primary: #FFFFFF;
                --md-sys-color-primary-container: #E8EAF6;
                --md-sys-color-on-primary-container: #1A237E;
                --md-sys-color-surface: #FFFFFF;
                --md-sys-color-on-surface: #1C1B1F;
                --md-sys-color-surface-variant: #F4F4F5;
                --md-sys-color-outline: #79747E;
                --md-sys-color-background: #F0F2F5;
                --font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
                --elevation-2: 0px 4px 6px -2px rgba(0, 0, 0, 0.05), 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
            }

            * { box-sizing: border-box; }
            
            body { 
                font-family: var(--font-family);
                background-color: var(--md-sys-color-background);
                margin: 0;
                padding: 20px;
                color: var(--md-sys-color-on-surface);
            }

            .main-container {
                max-width: 1000px;
                margin: 0 auto;
                background: var(--md-sys-color-surface);
                border-radius: 16px;
                box-shadow: var(--elevation-2);
                overflow: hidden;
            }

            .app-bar {
                background-color: var(--md-sys-color-primary);
                color: var(--md-sys-color-on-primary);
                padding: 24px 32px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-shadow: 0 4px 5px rgba(0,0,0,0.14);
            }
            
            .app-title { display: flex; align-items: center; gap: 16px; }
            .app-title h1 { margin: 0; font-size: 24px; font-weight: 500; }

            .stats-row { display: flex; gap: 12px; }
            .chip {
                background: rgba(255, 255, 255, 0.2);
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 500;
                display: flex;
                align-items: center;
            }

            .email-list { padding: 8px 0; background: var(--md-sys-color-surface); }

            .email-item {
                border-bottom: 1px solid var(--md-sys-color-surface-variant);
                transition: background-color 0.2s;
            }
            .email-item:last-child { border-bottom: none; }

            /* 【关键】添加 cursor: pointer 确保看起来可点击 */
            .email-summary {
                padding: 16px 24px;
                cursor: pointer;
                display: grid;
                grid-template-columns: 48px 1fr auto;
                gap: 16px;
                align-items: center;
                user-select: none; /* 防止快速点击时选中文本 */
            }
            .email-summary:hover { background-color: rgba(63, 81, 181, 0.04); }
            .email-summary:active { background-color: rgba(63, 81, 181, 0.08); }
            
            .avatar {
                width: 40px; height: 40px;
                background-color: var(--md-sys-color-primary-container);
                color: var(--md-sys-color-on-primary-container);
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-weight: bold; font-size: 16px;
                pointer-events: none; /* 让点击穿透到 summary */
            }

            .content-col { min-width: 0; pointer-events: none; }
            .sender-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
            .sender-name { font-weight: 600; font-size: 15px; color: #202124; }
            .sender-email { font-size: 12px; color: var(--md-sys-color-outline); }
            
            .subject-text {
                font-size: 14px; font-weight: 500; color: #3C4043;
                margin-bottom: 2px;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .preview-text {
                font-size: 13px; color: var(--md-sys-color-outline);
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }

            .meta-col { 
                text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; 
                pointer-events: none; 
            }
            .date-badge { font-size: 12px; color: var(--md-sys-color-outline); font-weight: 500; }
            
            .icon { width: 20px; height: 20px; fill: currentColor; }
            .icon-sm { width: 16px; height: 16px; fill: currentColor; }
            .icon-hero { width: 32px; height: 32px; fill: currentColor; }
            
            .chevron { color: var(--md-sys-color-outline); transition: transform 0.3s; }
            .email-item.active .chevron { transform: rotate(180deg); color: var(--md-sys-color-primary); }

            .email-detail-container {
                max-height: 0; overflow: hidden;
                transition: max-height 0.35s cubic-bezier(0.4, 0.0, 0.2, 1);
                background-color: #FAFAFA;
            }
            .email-detail-inner { padding: 0 24px 24px 24px; }

            .info-card {
                background: white; border: 1px solid #E0E0E0; border-radius: 8px;
                padding: 16px; margin: 16px 0;
                display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;
            }
            .info-item { display: flex; flex-direction: column; }
            .info-label { font-size: 11px; text-transform: uppercase; color: var(--md-sys-color-outline); margin-bottom: 4px; }
            .info-value { font-size: 13px; color: #333; word-break: break-all; }

            .action-bar { display: flex; justify-content: flex-end; margin-bottom: 12px; }
            .btn-text {
                background: none; border: none; color: var(--md-sys-color-primary);
                font-family: var(--font-family); font-weight: 500; font-size: 13px;
                padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px;
            }
            .btn-text:hover { background-color: rgba(63, 81, 181, 0.08); border-radius: 4px; }

            .iframe-wrapper { background: white; border-radius: 8px; border: 1px solid #E0E0E0; overflow: hidden; }
            iframe { width: 100%; border: none; height: 400px; display: block; }

            #snackbar {
                visibility: hidden; min-width: 250px; background-color: #323232; color: #fff;
                text-align: center; border-radius: 4px; padding: 14px 24px;
                position: fixed; z-index: 10; left: 50%; bottom: 30px;
                transform: translateX(-50%); font-size: 14px;
                opacity: 0; transition: opacity 0.3s, bottom 0.3s;
            }
            #snackbar.show { visibility: visible; opacity: 1; bottom: 50px; }

            @media (max-width: 600px) {
                .app-bar { padding: 16px; flex-direction: column; align-items: flex-start; gap: 16px; }
                .email-summary { grid-template-columns: 1fr auto; padding: 16px; }
                .avatar { display: none; }
                .stats-row { flex-wrap: wrap; }
                .sender-email { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="main-container">
            <header class="app-bar">
                <div class="app-title">
                    ${icons.email}
                    <h1>收件箱</h1>
                </div>
                <div class="stats-row">
                    <div class="chip">总数: ${responseJson.count}</div>
                    <div class="chip">当前: ${emails.length}</div>
                    <div class="chip">Offset: ${responseJson.offset}</div>
                </div>
            </header>
            
            <!-- 使用 id 方便 JS 查找 -->
            <main class="email-list" id="email-list-container">
    `
    
    emails.forEach((email, index) => {
        const fromName = email.from ? email.from.split('<')[0].replace(/