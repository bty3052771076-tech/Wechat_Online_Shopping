# Use official Node.js 22 Alpine image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Create necessary directories
RUN mkdir -p uploads/products logs && \
    chown -R nodejs:nodejs uploads logs

# Copy application source
COPY --chown=nodejs:nodejs . .

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Expose application port
EXPOSE 3000

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "src/app.js"]
