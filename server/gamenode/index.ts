import { GameServer } from './GameServer.js';

let server;
GameServer.createAsync()
    .then((createdServer) => server = createdServer)
    .catch((error) => {
        throw error;
    });
