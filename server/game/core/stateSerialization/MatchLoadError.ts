/**
 * Thrown by every load-side module (`SavedMatchValidator`, `MatchPositionInjector`, `AbilityLimitRestorer`,
 * `StateWatcherDeserializer`, `ChatRestorer`, `MatchLoader`) whenever a saved document cannot be trusted or
 * cannot be reproduced, so a caller has exactly one exception type to discriminate on. Its own module so
 * every one of those files can throw it without importing `MatchLoader` (which would create an import
 * cycle back through the modules it orchestrates).
 *
 * `diagnostics` carries structured detail (unresolved coordinates, both card-data versions, and so on) for
 * a caller that wants more than the message string; nothing under `server/` requires it to be present.
 *
 * Documented, not changed: several call sites pass `{ cause: error }` as `diagnostics` rather
 * than the standard `Error` `cause` option, so `error.cause` is never populated on those -- only
 * `error.diagnostics.cause` is. A caller after the original exception should read `diagnostics?.cause`,
 * not the inherited `cause` property, until/unless every call site is normalized onto one convention.
 */
export class MatchLoadError extends Error {
    public readonly diagnostics?: Readonly<Record<string, unknown>>;

    public constructor(message: string, diagnostics?: Readonly<Record<string, unknown>>) {
        super(message);
        this.name = 'MatchLoadError';
        this.diagnostics = diagnostics;
    }
}
