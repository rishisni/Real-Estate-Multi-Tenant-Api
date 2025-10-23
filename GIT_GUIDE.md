# Git Guide for Housingram Backend

## ✅ What Gets Committed

```
✅ Source Code         → All .js files in src/
✅ Configuration       → package.json, .env.example
✅ Documentation       → README.md, guides
✅ Migrations          → Database schema files
✅ Scripts             → Seed and utility scripts
✅ Postman Collection  → API testing files
```

## ❌ What's Ignored

```
❌ .env                → DATABASE CREDENTIALS & SECRETS!
❌ node_modules/       → Dependencies (too large)
❌ *.log               → Log files
❌ .DS_Store           → Mac OS junk
❌ .vscode/, .idea/    → IDE settings
❌ *.key, *.pem        → Private keys
```

## 🚀 Quick Git Setup

```bash
# Initialize repository
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: Multi-tenant property management system"

# Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/housingram-backend.git

# Push to GitHub
git push -u origin main
```

## 📝 Commit Message Examples

```bash
# Features
git commit -m "feat: Add unit booking functionality"
git commit -m "feat: Implement audit logging"

# Bug fixes
git commit -m "fix: Resolve schema isolation issue"
git commit -m "fix: Correct JWT token expiration"

# Documentation
git commit -m "docs: Update API documentation"

# Other
git commit -m "chore: Update dependencies"
```

## 🔐 Security Checklist

Before first commit:
- [ ] `.env` is NOT in git status
- [ ] No passwords in code
- [ ] `.env.example` has placeholders only

## 🔄 Setup for New Team Member

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/housingram-backend.git
cd housingram-backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with database credentials

# Setup database
createdb housingram_db
npm run migrate:public
npm run seed:super-admin

# Start server
npm start
```

## 🚨 If You Accidentally Commit .env

```bash
# Remove from git (keep locally)
git rm --cached .env
git commit -m "chore: Remove .env from git"
git push
```

## 📚 Useful Commands

```bash
# Check status
git status

# View history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard changes
git checkout -- filename.js
```

---

**Remember: NEVER commit `.env`!** 🔐

