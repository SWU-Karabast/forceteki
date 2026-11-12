// Enums for structured logging metadata.
//
// `logger` (server/logger.ts) renders a metadata object as `message | {json}` locally and as top-level
// JSON keys under AWS, so these values are what a CloudWatch Insights query filters on. Naming them
// here means a query is written against a known set rather than against string literals grepped out of
// the source, and renaming one is a compiler error instead of a dashboard that silently returns nothing.
//
// Add new logging enums to this file as more structured records land. Metadata shapes and any future
// logging helpers belong in this directory alongside it.

/**
 * Values for the `event` metadata field, identifying which kind of record a log line is.
 *
 * Unrelated to the rules engine's `GameEvent` - these name log records, not game state changes.
 */
export enum LogEvent {

    /** A player started searching: their queue key and competitiveness preference. */
    QueueJoin = 'queueJoin',

    /** Two players were paired: both preferences, how far each search had widened, and how long each waited. */
    MatchFormed = 'matchFormed',
}
