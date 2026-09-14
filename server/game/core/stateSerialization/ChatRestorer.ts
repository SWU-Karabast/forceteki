import type { ISerializedMessage, MessageText } from '../../Interfaces';
import { MatchLoadError } from './MatchLoadError';
import type { ISavedChatMessage } from './SavedMatchInterfaces';

/**
 * The inverse of `ChatScrubber.scrubChatMessages`. A scrubbed message already lost every object's `uuid`
 * and player/user id, so nothing here can (or needs to) reconstruct those; `game.gameChat.messages` only
 * ever needs the display shape back.
 *
 * `IScrubbedMessageValue -> MessageText` is a cast, not a checked narrowing: `MessageText`'s declared type
 * (`string | (string | number)[]`) understates the runtime shape a scrubbed message actually carries (a
 * `{ alert: ... }` wrapper, or a nested array), exactly as `ChatScrubber`'s own note says. This is the
 * unit's first of two documented casts.
 */
export function restoreChatMessages(saved: readonly ISavedChatMessage[]): ISerializedMessage[] {
    return saved.map((entry) => {
        const date = new Date(entry.date);
        if (Number.isNaN(date.getTime())) {
            throw new MatchLoadError(`Saved chat message has an unparseable date: ${JSON.stringify(entry.date)}.`);
        }

        return {
            date,
            message: entry.message as unknown as MessageText,
        };
    });
}
