# ── Stage 1: Build ────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (leverages Docker layer caching)
COPY package*.json ./
RUN npm ci

# Copy source, Prisma schema & config
COPY tsconfig*.json nest-cli.json ./
COPY prisma.config.ts ./
COPY src/ ./src/
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS app
RUN npm run build

# ── Stage 2: Production ──────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema + migrations + config for runtime migrate
COPY prisma/ ./prisma/
COPY prisma.config.ts ./

# Generate Prisma client in production node_modules
RUN npx prisma generate

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist

# Don't run as root
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup
USER appuser

EXPOSE 3000

# Run migrations then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
