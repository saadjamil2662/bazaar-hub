# Stage 1: Build the React application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy configuration files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the build files using Nginx
FROM nginx:alpine

# Copy the optimized build output from stage 1 to Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expose Nginx's default port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
