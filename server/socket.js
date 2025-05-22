const { logger } = require('./logger');
const EventEmitter = require('events');
const jwt = require('jsonwebtoken');
const env = require('./env.js');
const Contract = require('./game/core/utils/Contract');

class Socket extends EventEmitter {
    constructor(socket) {
        super();

        this.socket = socket;
        this.user = socket.data.user;

        socket.on('error', this.onError.bind(this));
        socket.on('authenticate', this.onAuthenticate.bind(this));
        socket.on('disconnect', this.onDisconnect.bind(this));
    }
    
    get ip() {
        return this.socket.handshake.address;
    }

    get id() {
        return this.socket.id;
    }

    // Commands

    removeEventsListeners(events) {
        events.forEach((event) => {
            this.socket.removeAllListeners(event);
        });
    }

    registerEvent(event, callback) {
        this.socket.on(event, async (...args) => {
            await this.onSocketEvent(callback, ...args);
        });
    }

    eventContainsListener(event) {
        return this.socket.eventNames().indexOf(event) !== -1;
    }

    joinChannel(channelName) {
        this.socket.join(channelName);
    }

    leaveChannel(channelName) {
        this.socket.leave(channelName);
    }

    send(message, ...args) {
        this.socket.emit(message, ...args);
    }

    disconnect() {
        this.socket.disconnect();
    }

    // Events
    async onSocketEvent(callback, ...args) {
        if (!this.user) {
            return;
        }

        try {
            await callback(this, ...args);
        } catch (err) {
            logger.info('WebSocket Error:', err);
        }
    }

    onAuthenticate(token) {
        Contract.assertTrue(!!env.NEXTAUTH_SECRET, 'NEXTAUTH_SECRET environment variable must be set and not empty for authentication to work');
        jwt.verify(token, env.NEXTAUTH_SECRET, (err, user) => {
            if (err) {
                logger.info(err);
                return;
            }

            this.socket.request.user = user;
            this.user = user;
            this.emit('authenticate', this, user);
        });
    }

    onDisconnect(reason) {
        this.emit('disconnect', this, reason);
    }

    onError(err) {
        logger.info('Socket.IO error', err, '. Socket ID ', this.socket.id);
    }
}

module.exports = Socket;
