# Stage 1: Install dependencies and build
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Build (con DATABASE_URL dummy para prisma generate)
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Generar Prisma Client y hacer build
RUN pnpm prisma generate
RUN pnpm build

# Stage 2: Production
FROM node:20-alpine AS production

RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# Instalar pnpm en producción también
RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production

# Copiar archivos necesarios
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/next.config.* ./

EXPOSE 3000

# Comando simple - el command en docker-compose manejará las migraciones
CMD ["pnpm", "start"]