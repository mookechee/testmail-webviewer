# Testmail Viewer

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen?style=flat-square&logo=github)](https://mookechee.github.io/testmail-webviewer/)
[![GitHub repo size](https://img.shields.io/github/repo-size/mookechee/testmail-webviewer?style=flat-square)](https://github.com/mookechee/testmail-webviewer)
[![GitHub stars](https://img.shields.io/github/stars/mookechee/testmail-webviewer?style=flat-square)](https://github.com/mookechee/testmail-webviewer/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mookechee/testmail-webviewer?style=flat-square)](https://github.com/mookechee/testmail-webviewer/network/members)
[![GitHub issues](https://img.shields.io/github/issues/mookechee/testmail-webviewer?style=flat-square)](https://github.com/mookechee/testmail-webviewer/issues)
[![GitHub license](https://img.shields.io/github/license/mookechee/testmail-webviewer?style=flat-square)](https://github.com/mookechee/testmail-webviewer/blob/main/LICENSE)

[中文](README.md) | [English](README.en.md)

Testmail Viewer is a Material Design-based web application for visualizing emails from [Testmail.app](https://testmail.app/). It provides a modern, responsive interface for developers and testers to view and debug emails easily.

![Testmail Viewer Screenshot](https://placehold.co/800x400?text=Testmail+Viewer+Screenshot)

## ✨ Features

*   **Modern Interface**: Clean and beautiful UI based on Material Design 3.
*   **Responsive Design**: Optimized for both desktop and mobile devices.
*   **Multi-View Support**: Switch between HTML and Plain Text views for email content.
*   **Attachments**: Intuitive display of email attachments and their sizes.
*   **Local Storage**: Automatically saves API Key and Namespace configuration.
*   **Easy Operation**: One-click copy for email content (HTML or text).
*   **Real-time Status**: Clear loading states and error notifications.
*   **Internationalization**: Supports both Chinese and English (toggle in-app).

## 🚀 Quick Start

### Online Demo (Recommended)

You can access the version hosted on GitHub Pages directly:
👉 **[https://mookechee.github.io/testmail-webviewer/](https://mookechee.github.io/testmail-webviewer/)**

### Run Locally

1.  Clone this repository:
    ```bash
    git clone https://github.com/mookechee/testmail-webviewer.git
    cd testmail-webviewer
    ```

2.  Open `index.html` directly in your browser.

    Or use a simple HTTP server:
    ```bash
    # Python 3
    python -m http.server 8000
    
    # Node.js (http-server)
    npx http-server
    ```
    Then visit `http://localhost:8000` in your browser.

## 📖 Usage Guide

1.  **Configure API**:
    *   Enter your Testmail.app **API Key** in the configuration area at the top.
    *   Enter your **Namespace**.
    *   (Optional) Enter a **Tag** to filter specific emails.

2.  **Fetch Emails**:
    *   Click the "Fetch Emails" button or press Enter.
    *   The email list will load and appear below.

3.  **View Details**:
    *   Click on any item in the email list to expand details.
    *   In the detail view, you can switch between "HTML View" and "Plain Text".
    *   Click the "Copy" button to copy email content to the clipboard.

## 🛠️ Tech Stack

*   **HTML5 / CSS3** (Theme customization via CSS Variables)
*   **JavaScript (ES6+)** (Vanilla JS, no third-party framework dependencies)
*   **Material Design** (Custom CSS implementation)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Issues and Pull Requests are welcome to improve this project!
