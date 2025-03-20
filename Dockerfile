# Use Node.js base image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy rest of the app code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the service
CMD ["npm", "run", "start:dev"]
