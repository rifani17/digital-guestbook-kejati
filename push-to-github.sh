#!/bin/bash
# Git Push Helper Script for Digital Guest Book

echo "=========================================="
echo "Digital Guest Book - GitHub Push Script"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "/app/.git" ]; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

cd /app

echo "📦 Repository Status:"
echo "-----------------------------------"
git status -s | head -10
echo ""

echo "📊 Commit History:"
echo "-----------------------------------"
git log --oneline -3
echo ""

echo "🔗 Remote Repository:"
echo "-----------------------------------"
git remote -v
echo ""

echo "📝 Ready to push to GitHub!"
echo ""
echo "⚠️  You need to authenticate with GitHub"
echo ""
echo "Choose your authentication method:"
echo ""
echo "Option 1: Personal Access Token (Recommended)"
echo "  1. Create token at: https://github.com/settings/tokens"
echo "  2. Run: git push -u origin main --force"
echo "  3. Username: rifani17"
echo "  4. Password: [PASTE YOUR TOKEN]"
echo ""
echo "Option 2: GitHub CLI"
echo "  1. Install: https://cli.github.com/"
echo "  2. Run: gh auth login"
echo "  3. Run: git push -u origin main --force"
echo ""
echo "Option 3: SSH Key"
echo "  1. Setup SSH: ssh-keygen -t ed25519"
echo "  2. Add to GitHub: https://github.com/settings/keys"
echo "  3. Change remote: git remote set-url origin git@github.com:rifani17/digital-guestbook-kejati.git"
echo "  4. Run: git push -u origin main --force"
echo ""
echo "=========================================="
echo "After successful push, verify at:"
echo "https://github.com/rifani17/digital-guestbook-kejati"
echo "=========================================="
