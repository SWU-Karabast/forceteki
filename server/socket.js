const { logger } = require('./logger');
const EventEmitter = require('events');
const jwt = require('jsonwebtoken');
const env = require('./env.js');

class Socket extends EventEmitter {
    constructor(socket) {
        super();

        this.socket = socket;
        this.user = socket.data.user;

        socket.on('error', this.onError.bind(this));
        socket.on('authenticate', this.onAuthenticate.bind(this));
        socket.on('disconnect', this.onDisconnect.bind(this));
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
        this.socket.on(event, this.onSocketEvent.bind(this, callback));
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
    onSocketEvent(callback, ...args) {
        if (!this.user) {
            return;
        }

        const handleError = (err) => logger.info('WebSocket Error:', err);

        try {
            const result = callback(this, ...args);
            if (result instanceof Promise) {
                result.catch(handleError);
            }
        } catch (err) {
            handleError(err);
        }
    }

    onAuthenticate(token) {
        jwt.verify(token, env.secret, (err, user) => {
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
