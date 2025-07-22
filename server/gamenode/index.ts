import { GameServer } from './GameServer.js';
import { monitorEventLoopDelay } from 'perf_hooks';
const eventLoopMonitor = monitorEventLoopDelay({ resolution: 10});

// eventLoopMonitor.enable();

// setInterval(() => {
//     const mean = (eventLoopMonitor.mean / 1e6).toFixed(2); // Convert ns to ms
//     const max = (eventLoopMonitor.max / 1e6).toFixed(2);

//     console.log(`[EventLoopLag] mean: ${mean}ms, max: ${max}ms`);

//     // const memory = process.memoryUsage();
//     // console.log(`[LoopLag] mean: ${Math.round(h.mean / 1e6)}ms, heapUsed: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
 
//     eventLoopMonitor.reset();
// }, 1000);

let server;
GameServer.createAsync()
    .then((createdServer) => server = createdServer)
    .catch((error) => {
        throw error;
    });
