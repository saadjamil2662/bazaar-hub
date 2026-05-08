FROM node:18-alpine

# Install Chromium and Chromedriver
RUN apk update && apk add --no-cache \
    chromium \
    chromium-chromedriver

# Set environment variables for Puppeteer/Selenium
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy test files
COPY . .

# Run the test suite
CMD ["npm", "test"]
