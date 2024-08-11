# Stage 1: Build the React app
FROM node:18-alpine AS build

# Set environment variables
ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies with caching, to speed up subsequent builds
RUN npm ci --only=production

# Copy the rest of the application code to the container
COPY . .

# Build the React app for production
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the build output to the Nginx HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Ensure the Nginx cache directory exists and has the right permissions
RUN mkdir -p /var/cache/nginx && \
    chmod -R 755 /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx

# Set permissions for the Nginx HTML directory
RUN chown -R nginx:nginx /usr/share/nginx/html

# Switch to non-root user for security
USER nginx

# Expose the port Nginx will serve on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
