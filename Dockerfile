# German Job Bot - Dockerfile

FROM node:20-alpine

# Install dependencies for Playwright
RUN apk add --no-cache \
    chromium \
    chromium-chromedriver \
    ca-certificates \
    fonts-freefont-ttf

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app files
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3001

# Start the app
CMD ["node", "server.js"]
