#!/bin/bash
# ════════════════════════════════════════════════════════════
# TechGram Backend — EC2 Server Setup Script
# Run this on a fresh Ubuntu 24.04 LTS EC2 instance
# Usage: chmod +x setup-server.sh && sudo ./setup-server.sh
# ════════════════════════════════════════════════════════════

set -euo pipefail

echo "🚀 Setting up TechGram server..."

# ── 1. System Updates ────────────────────────────────────
echo "📦 Updating system packages..."
apt-get update -y && apt-get upgrade -y

# ── 2. Install Docker ────────────────────────────────────
echo "🐳 Installing Docker..."
apt-get install -y ca-certificates curl gnupg lsb-release

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add ubuntu user to docker group (no sudo needed for docker commands)
usermod -aG docker ubuntu

# ── 3. Install Git ───────────────────────────────────────
echo "📂 Installing Git..."
apt-get install -y git

# ── 4. Create App Directory ──────────────────────────────
echo "📁 Creating app directory..."
mkdir -p /home/ubuntu/techgram-backend
chown ubuntu:ubuntu /home/ubuntu/techgram-backend

# ── 5. Configure Swap (t2.micro has only 1GB RAM) ────────
echo "💾 Setting up 2GB swap file..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# ── 6. Configure Firewall (UFW) ─────────────────────────
echo "🔒 Configuring firewall..."
apt-get install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# ── 7. Setup Auto-cleanup ───────────────────────────────
echo "🧹 Setting up Docker auto-cleanup cron..."
(crontab -l 2>/dev/null; echo "0 3 * * 0 docker system prune -af --volumes 2>&1 | logger -t docker-cleanup") | crontab -

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ Server setup complete!"
echo ""
echo "Next steps:"
echo "  1. Log out and back in (for docker group to take effect)"
echo "  2. Clone your repo:"
echo "     cd /home/ubuntu && git clone <your-github-repo-url> techgram-backend"
echo "  3. Create .env.production from the template"
echo "  4. Run: cd techgram-backend && docker compose -f docker-compose.prod.yml up -d"
echo "════════════════════════════════════════════════════════"
