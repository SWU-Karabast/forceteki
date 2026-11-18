import { GameServer } from './GameServer.js';
import { warmEngineVersion } from '../game/core/swupgn/FileAssembler';
import { idSecretStartupError } from '../game/core/swupgn/swuPgnIdentity';
import { logger } from '../logger';

// Resolve the SWU-PGN engine version now, at startup, so the `git rev-parse` it may shell out to never lands on a
// game's path and stalls every concurrent game on this process.
warmEngineVersion();

const idSecretError = idSecretStartupError(process.env);
if (idSecretError) {
    logger.error(idSecretError);
}

let server;
GameServer.createAsync()
    .then((createdServer) => server = createdServer)
    .catch((error) => {
        throw error;
    });
