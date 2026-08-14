
FROM node:20-slim AS builder

WORKDIR /app

# Install system build deps and Rust toolchain so native addons (lightningcss) can build
RUN apt-get update && apt-get install -y --no-install-recommends \
		curl \
		build-essential \
		python3 \
		ca-certificates \
		pkg-config \
		libssl-dev \
	&& rm -rf /var/lib/apt/lists/*

# Install rustup (non-interactive)
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Node deps (will compile native modules using Rust if needed)
COPY package.json package-lock.json ./
RUN npm ci

# Copy sources and build
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
	CMD curl -f http://localhost:3000/ || exit 1

CMD ["npm", "run", "start"]
