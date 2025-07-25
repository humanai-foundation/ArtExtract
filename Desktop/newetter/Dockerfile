# ---- Stage 1: Node.js Build Stage ----
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies including devDependencies for build
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copy the rest of the project and build
COPY . .
RUN npm run build

# ---- Stage 2: Python + Node + OpenCV + MediaPipe Production Stage ----
FROM python:3.10-slim AS production

WORKDIR /app

# Install Python dependencies
COPY requirements.txt ./
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip setuptools wheel && \
    /opt/venv/bin/pip install --timeout=1000 --no-cache-dir -r requirements.txt

# System packages required for OpenCV, MediaPipe, Node.js
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \
        git \
        curl \
        libgl1 \
        libglib2.0-0 \
        libgstreamer1.0-0 \
        supervisor \
        build-essential \
        cmake \
        libopencv-dev \
        nodejs \
        npm && \
    rm -rf /var/lib/apt/lists/*

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client ./client
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/vite.config.ts ./vite.config.ts
COPY --from=builder /app/vite.config.server.ts ./vite.config.server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Install only production dependencies for final image
RUN npm ci --only=production && npm cache clean --force

# Create non-root user
RUN addgroup --gid 1001 nodejs && \
    adduser --uid 1001 --disabled-password --gecos "" --ingroup nodejs appuser && \
    chown -R appuser:nodejs /app

USER appuser

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    IN_DOCKER=true \
    PYTHONPATH=/app

EXPOSE 8080

# Health check endpoint (optional)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api/ping || exit 1

# Start the server
CMD ["npm", "start"]
