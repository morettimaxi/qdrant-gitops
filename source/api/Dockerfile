# Dockerfile for the Backend
# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install --production

# Copy the rest of the application code to the container
COPY . .

# Expose the port the API will run on
EXPOSE 8081

# Define the command to run your app
CMD ["npm", "start"]
