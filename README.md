# Testmail Viewer

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen?style=flat-square&logo=github)](https://mookechee.github.io/testmail-webviewer/)
[![GitHub repo size](https://img.shields.io/github/repo-size/mookechee/testmail-webviewer?style=flat-square)](https://github.com/mookechee/testmail-webviewer)
[![GitHub stars](https://img.shields.io/github/stars/mookechee/testmail-webviewer?style=flat-square)](https://github.com/mookechee/testmail-webviewer/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mookechee/testmail-webviewer?style=flat-square)](https://github.com/mookechee/testmail-webviewer/network/members)
[![GitHub issues](https://img.shields.io/github/issues/mookechee/testmail-webviewer?style=flat-square)](https://github.com/mookechee/testmail-webviewer/issues)
[![GitHub license](https://img.shields.io/github/license/mookechee/testmail-webviewer?style=flat-square)](https://github.com/mookechee/testmail-webviewer/blob/main/LICENSE)

Testmail Viewer 是一个基于 Material Design 设计风格的 Web 应用程序，用于可视化展示来自 [Testmail.app](https://testmail.app/) 的邮件。它提供了一个现代、响应式的界面，方便开发者和测试人员查看和调试邮件。

![Testmail Viewer Screenshot](https://placehold.co/800x400?text=Testmail+Viewer+Screenshot)

## ✨ 功能特点

*   **现代化界面**：采用 Material Design 3 风格，界面简洁美观。
*   **响应式设计**：适配桌面和移动设备，随时随地查看邮件。
*   **多视图支持**：支持 HTML 和纯文本邮件内容的查看与切换。
*   **附件展示**：直观展示邮件附件列表及大小。
*   **本地存储**：自动保存 API Key 和 Namespace 配置，无需重复输入。
*   **便捷操作**：支持一键复制邮件内容（HTML 或文本）。
*   **实时状态**：清晰的加载状态和错误提示。

## 🚀 快速开始

### 在线使用 (推荐)

您可以直接访问托管在 GitHub Pages 上的版本：
👉 **[https://mookechee.github.io/testmail-webviewer/](https://mookechee.github.io/testmail-webviewer/)**

### 本地运行

1.  克隆本仓库到本地：
    ```bash
    git clone https://github.com/mookechee/testmail-webviewer.git
    cd testmail-webviewer
    ```

2.  直接在浏览器中打开 `index.html` 文件即可运行。

    或者使用简单的 HTTP 服务器：
    ```bash
    # Python 3
    python -m http.server 8000
    
    # Node.js (http-server)
    npx http-server
    ```
    然后在浏览器访问 `http://localhost:8000`。

## 📖 使用指南

1.  **配置 API**：
    *   在页面顶部的配置区域输入您的 Testmail.app **API Key**。
    *   输入您的 **Namespace**。
    *   (可选) 输入 **Tag** 以筛选特定标签的邮件。

2.  **获取邮件**：
    *   点击 "获取邮件" 按钮或按回车键。
    *   邮件列表将加载并在下方显示。

3.  **查看详情**：
    *   点击邮件列表中的任意一项展开详情。
    *   在详情页中，您可以切换 "HTML 视图" 和 "纯文本" 视图。
    *   点击 "复制" 按钮可以将邮件内容复制到剪贴板。

## 🛠️ 技术栈

*   **HTML5 / CSS3** (使用 CSS Variables 实现主题定制)
*   **JavaScript (ES6+)** (原生 JS，无第三方框架依赖)
*   **Material Design** (自定义 CSS 实现)

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件（如果包含）。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！
