import { GameServer } from './GameServer.js';
import { SwuPgnGameAdapter } from '../game/core/chat/SwuPgnGameAdapter';

// Resolve the engine version now, at startup, so the `git rev-parse` it may shell out to never
// lands on a game-end path and stall every concurrent game on this process.
SwuPgnGameAdapter.warmEngineVersion();

let server;
GameServer.createAsync()
    .then((createdServer) => server = createdServer)
    .catch((error) => {
        throw error;
    });
