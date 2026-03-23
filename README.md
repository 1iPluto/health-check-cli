# 🩺 health-check-cli

> A lightweight, zero-config CLI tool for Node.js developers to validate environment variables and inspect project health — right from the terminal.

[![npm version](https://img.shields.io/npm/v/health-check-cli.svg)](https://www.npmjs.com/package/health-check-cli)
[![npm downloads](https://img.shields.io/npm/dm/health-check-cli.svg)](https://www.npmjs.com/package/health-check-cli)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![GitHub Pages](https://img.shields.io/badge/demo-github.io-blue)](https://1iPluto.github.io/health-check-cli)

---

## 🌐 Live Demo

**[View the interactive demo →](https://1iPluto.github.io/health-check-cli)**

---

## ✨ Features

| Command            | Description                                                      |
|--------------------|------------------------------------------------------------------|
| `health-check env` | Validates your `.env` file against all keys in `.env.example`   |
| `health-check size`| Calculates and displays total size of `node_modules`            |
| `health-check all` | Runs all checks and prints a full Project Health Report         |

- ✅ Detects **missing** and **empty** environment variables
- 📊 Color-coded visual size bar for `node_modules`
- 🌈 Beautiful terminal output with colors and spinners
- 🛡️ Graceful error handling — never crashes on missing files
- ⚡ Built with ES Modules, zero custom build step

---

## 📦 Installation

### From npm (recommended)

```bash
npm install -g health-check-cli
```

### Local development with `npm link`

```bash
git clone https://github.com/1iPluto/health-check-cli.git
cd health-check-cli
npm install
npm link
```

To unlink later:
```bash
npm unlink -g health-check-cli
```

---

## 🚀 Usage

Navigate to any Node.js project directory and run:

### Validate Environment Variables

```bash
health-check env
```

```
✔  DATABASE_URL
✔  JWT_SECRET
⚠  REDIS_URL        (defined but empty)
✖  STRIPE_SECRET    (missing from .env)

✖ 2 issue(s) found  (2/4 variables OK)
```

**Custom paths:**

```bash
health-check env --example .env.staging --local .env.local
```

### Check node_modules Size

```bash
health-check size
```

```
  node_modules Size Report:

  Path:   /Users/you/my-project/node_modules
  Size:   312.47 MB
  Status: Average size. Consider auditing with `npm ls`.

  [█████████░░░░░░░░░░░░░░░░░░░░░] 312.47 MB / ~1 GB scale
```

### Run All Checks at Once

```bash
health-check all
```

### Get Help

```bash
health-check --help
health-check env --help
health-check size --help
```

---

## ⚙️ Options

| Command | Option | Default | Description |
|---------|--------|---------|-------------|
| `env` | `--example <path>` | `.env.example` | Path to the example env file |
| `env` | `--local <path>` | `.env` | Path to the local env file to validate |
| `size` | `--dir <path>` | `./node_modules` | Path to the directory to measure |

---

## 🗂 Project Structure

```
health-check-cli/
├── index.js                        # Main CLI entry point
├── utils/
│   ├── envCheck.js                 # Env validation logic
│   └── sizeCheck.js                # node_modules size calculation
├── docs/
│   └── index.html                  # GitHub Pages demo site
├── .github/
│   └── workflows/
│       └── pages.yml               # Auto-deploy demo to GitHub Pages
├── package.json
├── LICENSE
└── README.md
```

---

## 🛠 Tech Stack

- **[commander](https://github.com/tj/commander.js)** — CLI argument parsing
- **[chalk](https://github.com/chalk/chalk)** — Terminal string styling
- **[ora](https://github.com/sindresorhus/ora)** — Elegant terminal spinners

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the repo
2. Create your feature branch: `git checkout -b feat/my-new-feature`
3. Commit your changes: `git commit -m "feat: add my new feature"`
4. Push to the branch: `git push origin feat/my-new-feature`
5. Open a Pull Request

---

## 📄 License

[MIT](./LICENSE) — free to use, modify, and distribute.

---

<p align="center">Made with ❤️ for the developer community</p>
