
FROM caddy:2.7.6-alpine

# Install Node.js and npm
RUN apk add --no-cache nodejs npm tini

# Set tini as the container's init system
ENTRYPOINT ["/sbin/tini", "--"]

WORKDIR /app

# Copy built app and runtime code from builder stage
COPY ./build /app/app
COPY ./server /app/server
COPY ./node_modules /app/node_modules
COPY ./package*.json /app/
COPY ./Caddyfile /etc/caddy/Caddyfile

# Set environment variables
ENV ENVIRONMENT="production"
ENV GAME_NODE_HOST="localhost"
ENV GAME_NODE_NAME="test1"
ENV GAME_NODE_SOCKET_IO_PORT="9500"

# Expose app port (internal only — Caddy handles public traffic)
EXPOSE 9500

# Start Node app and Caddy together
CMD ["sh", "-c", "node ./app/server/gamenode & caddy run --config /etc/caddy/Caddyfile --adapter caddyfile"]