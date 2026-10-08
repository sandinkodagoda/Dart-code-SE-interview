# ==========================================
# NEXORA Backend - Production Dockerfile
# ==========================================

# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Native module build dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build


# ---------- Production ----------
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Required for native Node modules such as argon2
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev
RUN npx prisma generate

COPY --from=builder /usr/src/app/dist ./dist

RUN mkdir -p uploads \
    && chown -R node:node /usr/src/app

USER node

EXPOSE 5000

CMD ["node", "dist/main"]
