# ==============================================================================
# SmartAttend Backend - Production Container Image
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Run as non-root user
USER node

EXPOSE 5000

ENV PORT=5000 \
    NODE_ENV=production

CMD ["node", "server.js"]
