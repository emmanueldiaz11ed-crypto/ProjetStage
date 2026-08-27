
FROM node:20-slim AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_EPL_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_EPL_API_URL=${NEXT_PUBLIC_EPL_API_URL}

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
RUN mkdir -p /app/.next/cache/images
RUN npm run build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8001

RUN apt-get update && apt-get install -y --no-install-recommends \
		curl \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./next.config.mjs
RUN mkdir -p /app/.next/cache/images && chmod -R 777 /app/.next/cache

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
	CMD curl -f http://localhost:8001/ || exit 1

CMD ["npm", "run", "start", "--", "--port", "8001"]
