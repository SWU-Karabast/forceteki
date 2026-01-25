FROM node:lts

WORKDIR /app

# Copy built app and runtime code
COPY ./build /app/app
COPY ./server /app/server
COPY ./test/json /app/data
COPY ./node_modules /app/node_modules
COPY ./package*.json /app/

# Set environment variables
ENV ENVIRONMENT="production"
ENV GAME_NODE_HOST="localhost"
ENV GAME_NODE_NAME="test1"
ENV GAME_NODE_SOCKET_IO_PORT="9500"

# Expose app port (ALB will handle SSL/TLS termination)
EXPOSE 9500

# Start Node app
CMD ["node", "./app/server/gamenode"]