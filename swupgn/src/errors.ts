export class SwuPgnError extends Error {
    public readonly code: string;
    public readonly line?: number;

    public constructor(code: string, message: string, line?: number) {
        super(message);
        this.name = 'SwuPgnError';
        this.code = code;
        this.line = line;
    }
}
