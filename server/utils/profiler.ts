import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import inspector from 'inspector';
import * as env from '../env';

const writeFile = promisify(fs.writeFile);

const ARTIFACT_DIR = env.PROFILE_DIR ?? '/tmp';

function ts() {
    return new Date().toISOString()
        .replace(/[:.]/g, '-');
}

export class RuntimeProfiler {
    private session: inspector.Session;
    private cpuActive = false;
    private samplingActive = false;

    public constructor() {
        this.session = new inspector.Session();
        this.session.connect(); // internal, no TCP port exposure
    }

    public async startCPU() {
        if (this.cpuActive) {
            return;
        }
        await this.post('Profiler.enable');
        await this.post('Profiler.start');
        this.cpuActive = true;
    }

    public async stopCPU(label = 'cpu') {
        if (!this.cpuActive) {
            return null;
        }
        const { profile } = await this.post('Profiler.stop');
        this.cpuActive = false;
        await this.post('Profiler.disable');
        const file = path.join(ARTIFACT_DIR, `${label}.${ts()}.cpuprofile`);
        await writeFile(file, JSON.stringify(profile));
        return file;
    }

    public async startAllocSampling(samplingIntervalBytes = 1024 * 64 /* 64KB */) {
        if (this.samplingActive) {
            return;
        }
        await this.post('HeapProfiler.enable');
        await this.post('HeapProfiler.startSampling', {
            samplingInterval: samplingIntervalBytes, // smaller = more detail, more overhead
            stackDepth: 64
        });
        this.samplingActive = true;
    }

    public async stopAllocSampling(label = 'alloc-sampling') {
        if (!this.samplingActive) {
            return null;
        }
        const { profile } = await this.post('HeapProfiler.stopSampling');
        this.samplingActive = false;
        await this.post('HeapProfiler.disable');
        const file = path.join(ARTIFACT_DIR, `${label}.${ts()}.heapprofile`);
        await writeFile(file, JSON.stringify(profile));
        return file;
    }

    private post(method: string, params: any = {}) {
        return new Promise<any>((resolve, reject) => {
            this.session.post(method, params, (err, result) => (err ? reject(err) : resolve(result)));
        });
    }
}
