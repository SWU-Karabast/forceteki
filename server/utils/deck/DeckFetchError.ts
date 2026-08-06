/**
 * Typed error returned from backend deck-link fetchers. The HTTP `status` and
 * user-facing `message` are designed to be passed through to the client.
 */
export class DeckFetchError extends Error {
    public readonly status: number;

    public constructor(status: number, message: string) {
        super(message);
        this.name = 'DeckFetchError';
        this.status = status;
    }
}
