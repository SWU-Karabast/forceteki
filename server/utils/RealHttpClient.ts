import type { IHttpClient } from './IHttpClient';

/** Production default: a thin pass-through to the global `fetch`. */
export class RealHttpClient implements IHttpClient {
    public fetch(url: string, init?: RequestInit): Promise<Response> {
        return fetch(url, init);
    }
}
