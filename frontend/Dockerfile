# Multi-stage Dockerfile for AssetTrack React Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies using clean install
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source and build production bundle
COPY . .
RUN npm run build


# Production Web Server Stage
FROM nginx:1.27-alpine

# Copy custom Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
