# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runtime Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Tạo non-root user để tăng cường bảo mật
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/

# Phân quyền cho non-root user
USER nodejs

EXPOSE 5000

CMD ["node", "src/index.js"]
