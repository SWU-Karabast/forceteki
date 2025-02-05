import { GameServer } from './GameServer.js';

let server;
GameServer.create().then((createdServer) => server = createdServer);
