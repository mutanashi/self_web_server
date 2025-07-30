# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Production stage ---
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/app ./app
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/components ./components
COPY --from=builder /app/middleware.ts ./middleware.ts
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/types.tsx ./types.tsx
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 8000
CMD ["npx", "next", "start", "-p", "8000", "-H", "0.0.0.0"]

