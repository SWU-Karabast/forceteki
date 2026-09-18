import { GameServer } from './GameServer.js';

// P3-PA4: hard-fail dev boot if the generated state serializer model has drifted from the runtime decorator
// metadata (StateSerializerCoverageCheck.ts). Dev-gated dynamic require(), not a static import - a static
// import would load the generated-serializer module graph unconditionally at production boot regardless of
// this gate, contradicting StateSerializers.ts's documented "no live-engine importer yet" invariant. Mirrors
// the existing require() pattern at server/game/cards/Index.ts.
if (process.env.ENVIRONMENT === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { checkStateSerializerCoverage } = require('../game/core/StateSerializerCoverageCheck');
    checkStateSerializerCoverage();
}

let server;
GameServer.createAsync()
    .then((createdServer) => server = createdServer)
    .catch((error) => {
        throw error;
    });
