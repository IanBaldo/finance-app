# Financial Planning App 💰

A desktop and web application designed for managing personal finances. Built with **Vue 3**, **TypeScript**, **Vite**, **Pinia**, **ECharts**, and **Electron**.

---

## 📌 Overview

This application was created to help track, organize, and manage personal finances. It provides intuitive visualizations and data management tools to monitor your financial health.

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+ recommended) and `npm` installed on your machine.

### 2. Install Dependencies

To install all required project dependencies, open your terminal in the project directory and run:

```bash
npm install
```

---

## 💻 Running the Development Server

To launch the local development web server with live reloading:

```bash
npm run dev
```

Once started, open your browser at the URL shown in the terminal (typically `http://localhost:5173`).

*(Optional)* To launch the application in desktop Electron mode during development:

```bash
npm run desktop
```

---

## 📦 Building the Windows Executable

The app is fully configured and ready to be packaged into a standalone Windows executable (`.exe`).

To build the executable, run:

```bash
npm run pack:win
```

This command builds the frontend assets with Vite and compiles the installer using Electron Builder. Once completed, the output installer will be located in the `release/` directory.

---

## 🛠️ Built With

- [Vue 3](https://vuejs.org/) - Frontend Framework
- [Vite](https://vitejs.dev/) - Frontend Tooling & Build Tool
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Pinia](https://pinia.vuejs.org/) - State Management
- [ECharts](https://echarts.apache.org/) / [vue-echarts](https://github.com/ecomfe/vue-echarts) - Data Visualization
- [Electron](https://www.electronjs.org/) & [Electron Builder](https://www.electron.build/) - Desktop Application Packaging
