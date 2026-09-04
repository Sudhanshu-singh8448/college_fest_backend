#!/bin/bash
# ════════════════════════════════════════════════════════════
# TechGram Backend — SSL Certificate Setup
# Run AFTER your domain DNS is pointing to the Elastic IP
# Usage: chmod +x setup-ssl.sh && ./setup-ssl.sh
# ════════════════════════════════════════════════════════════

set -euo pipefail

DOMAIN="api.sponsiwise.app"
EMAIL="sudhanshusingh8448@gmail.com"
PROJECT_DIR="/home/ubuntu/techgram-backend"

echo "🔐 Setting up SSL for ${DOMAIN}..."

# Step 1: Make sure Nginx is running (HTTP only, for ACME challenge)
echo "📋 Starting Nginx in HTTP-only mode..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.prod.yml up -d nginx

# Step 2: Request SSL certificate via Certbot
echo "📜 Requesting Let's Encrypt certificate..."
docker compose -f docker-compose.prod.yml run --rm certbot \
    certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN"

# Step 3: Enable the HTTPS server block in nginx.conf
echo "✏️ Enabling HTTPS in Nginx config..."
cd "$PROJECT_DIR/nginx"
sed -i 's/^    # server {/    server {/' nginx.conf
sed -i 's/^    #     /        /' nginx.conf
sed -i 's/^    # }/    }/' nginx.conf

# Step 4: Restart Nginx to load SSL config
echo "🔄 Restarting Nginx with SSL..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.prod.yml restart nginx

# Step 5: Setup auto-renewal cron (renew every 12 hours)
echo "⏰ Setting up certificate auto-renewal..."
(crontab -l 2>/dev/null; echo "0 */12 * * * cd $PROJECT_DIR && docker compose -f docker-compose.prod.yml run --rm certbot renew --quiet && docker compose -f docker-compose.prod.yml restart nginx") | crontab -

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ SSL setup complete!"
echo ""
echo "Your API is now available at: https://${DOMAIN}"
echo "Swagger docs: https://${DOMAIN}/api/docs"
echo "Certificate will auto-renew every 12 hours."
echo "════════════════════════════════════════════════════════"
