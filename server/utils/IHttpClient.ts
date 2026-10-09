/**
 * The network boundary for outbound HTTP calls the game node makes to external services (currently
 * the SWUStats and SWUBase stat-site integrations). Mirrors the single method of the global `fetch`
 * that callers use, so production code is a drop-in replacement for calling `fetch` directly.
 *
 * Exists so tests can substitute a fake that records requests and returns configurable responses,
 * instead of the real network, while the handler logic that builds payloads and interprets
 * responses keeps running for real.
 */
export interface IHttpClient {
    fetch(url: string, init?: RequestInit): Promise<Response>;
}
