# Multi-stage Dockerfile for Electronics E-Commerce Backend

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy application source
COPY . .

# Generate Prisma Client and build NestJS production bundle
RUN npx prisma generate
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Install production dependencies only
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev

# Generate Prisma Client for the production node_modules
RUN npx prisma generate

# Copy built application output from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads && chown -R node:node uploads

USER node

EXPOSE 5000

CMD ["node", "dist/main"]
