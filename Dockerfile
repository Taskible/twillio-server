# Use an official Node runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages
RUN npm install

# Bundle app source inside the Docker image
COPY . .

# Make port 3000 available outside this container
EXPOSE 3000

# Define the runtime command to run when starting the container
CMD ["node", "server.js"]
