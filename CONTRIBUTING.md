# Contributing to OpenClaw Daily Report

Thank you for considering contributing!

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/openclaw-daily-report.git
   ```
3. Create a branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. Make changes and test:
   ```bash
   npm install
   node index.js --dry-run --max 10
   ```
5. Commit and push:
   ```bash
   git add .
   git commit -m "Add amazing feature"
   git push origin feature/amazing-feature
   ```
6. Open a Pull Request

## 📝 Development Guidelines

- Keep code modular (parser, filter, formatter, utils)
- Update tests when changing logic
- Bump version in `package.json` for breaking changes
- Update README for new features or config changes

## 🧪 Testing

```bash
# Dry run with small sample
node index.js --dry-run --max 5

# Full run (writes to memory/daily-reports/)
node index.js
```

## 📦 Releasing

1. Update CHANGELOG.md
2. Bump version in `package.json`
3. Tag the release:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```
4. Create GitHub Release with notes

## ❓ Questions?

Open an issue or reach out to the maintainers.

---

By contributing, you agree that your contributions will be licensed under the MIT License.