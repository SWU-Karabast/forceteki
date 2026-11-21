import type { IHttpClient } from '../../../server/utils/IHttpClient';

/** An outbound HTTP request the fake client recorded, exactly as `fetch` would have sent it. */
export interface IFakeHttpRequest {
    url: string;
    method: string;
    headers: Record<string, string>;

    /** The raw request body. Stat handlers send either a JSON string or a `URLSearchParams` body; both stringify, so this is always a string or `undefined`. */
    body: string | undefined;
}

/** A canned response to return for a request. Defaults to a successful, empty JSON body. */
export interface IFakeHttpResponse {
    status?: number;
    body?: unknown;
}

/**
 * A controllable, in-process stand-in for {@link IHttpClient}, the network boundary `SwuStatsHandler`
 * / `SwuBaseHandler` call through instead of the global `fetch`. No request ever reaches the real
 * network: every call is recorded in {@link requests} for a test to assert on, and answered with a
 * configurable canned response built from the real global `Response` class, so handler code reading
 * `.ok` / `.status` / `.json()` / `.text()` gets genuinely spec-compliant behaviour rather than a
 * hand-rolled approximation.
 *
 * Unconfigured requests default to a 200 with an empty JSON body, so a test only needs to configure
 * a response when it cares about a non-default one (an error, a specific token payload, ...).
 *
 * ```ts
 * harness.httpClient.setResponse('SubmitGameResult', { status: 500, body: { error: 'nope' } });
 * ...
 * const [sent] = harness.httpClient.requestsTo('SubmitGameResult');
 * expect(JSON.parse(sent.body).winner).toBe(1);
 * ```
 */
export class FakeHttpClient implements IHttpClient {
    private readonly _requests: IFakeHttpRequest[] = [];
    private readonly queuedResponsesByUrl = new Map<string, IFakeHttpResponse[]>();
    private defaultResponse: IFakeHttpResponse = { status: 200, body: {} };

    /** Every request recorded so far, in call order. */
    public get requests(): readonly IFakeHttpRequest[] {
        return this._requests;
    }

    /** Requests whose URL contains the given substring, in call order. */
    public requestsTo(urlSubstring: string): IFakeHttpRequest[] {
        return this._requests.filter((request) => request.url.includes(urlSubstring));
    }

    /**
     * Configures the response(s) for any request whose URL contains the given substring. Multiple
     * responses are consumed one per matching call, in order; once exhausted, the last one keeps
     * being reused for further matching calls.
     */
    public setResponse(urlSubstring: string, ...responses: IFakeHttpResponse[]): void {
        this.queuedResponsesByUrl.set(urlSubstring, [...responses]);
    }

    /** Sets the response returned for a request that does not match any URL configured via {@link setResponse}. */
    public setDefaultResponse(response: IFakeHttpResponse): void {
        this.defaultResponse = response;
    }

    public fetch(url: string, init?: RequestInit): Promise<Response> {
        this._requests.push({
            url,
            method: init?.method ?? 'GET',
            headers: normalizeHeaders(init?.headers),
            body: normalizeBody(init?.body),
        });

        return Promise.resolve(buildResponse(this.takeResponseFor(url) ?? this.defaultResponse));
    }

    private takeResponseFor(url: string): IFakeHttpResponse | undefined {
        for (const [urlSubstring, queue] of this.queuedResponsesByUrl) {
            if (url.includes(urlSubstring)) {
                return queue.length > 1 ? queue.shift() : queue[0];
            }
        }

        return undefined;
    }
}

function normalizeHeaders(headers: RequestInit['headers']): Record<string, string> {
    if (!headers) {
        return {};
    }

    if (headers instanceof Headers) {
        return Object.fromEntries(headers.entries());
    }

    if (Array.isArray(headers)) {
        return Object.fromEntries(headers);
    }

    return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, String(value)]));
}

function normalizeBody(body: RequestInit['body']): string | undefined {
    if (body === undefined || body === null) {
        return undefined;
    }

    // Every call site in this codebase sends a `string` (JSON.stringify) or `URLSearchParams` body,
    // both of which stringify to the wire representation via `String()`.
    return String(body);
}

function buildResponse(response: IFakeHttpResponse): Response {
    const body = response.body === undefined ? '' : JSON.stringify(response.body);

    return new Response(body, {
        status: response.status ?? 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
