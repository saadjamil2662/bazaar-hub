# Use official Node.js image as base
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the API port (Backend uses 5000 by default)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
