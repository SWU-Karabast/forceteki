# Use the official Node.js:lst runtime as a base image
FROM node:lts

# Set the working directory in the container
WORKDIR /app

# Copy the build over
COPY ./build/ ./app

# Copy our dependencies
COPY ./node_modules ./node_modules

# ENV variables w/ dummy values
ENV GAME_NODE_HOST="localhost"
ENV GAME_NODE_NAME="test1"
ENV GAME_NODE_SOCKET_IO_PORT="9500"
ENV ENVIRONMENT="production"
ENV SECRET="verysecret"

EXPOSE 9500

# Tell docker what command will start the application
CMD [ "node", "./app/server/gamenode" ]
