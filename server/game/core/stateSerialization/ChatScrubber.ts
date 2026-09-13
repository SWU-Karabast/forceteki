import type { ISerializedMessage } from '../../Interfaces';
import type { ISavedChatMessage, IScrubbedMessageValue } from './SavedMatchInterfaces';

/**
 * `game.gameChat.messages` is already formatted at write time: `tryFormatPlaceholder` has replaced each
 * `GameObject` argument with its `getShortSummary()` object (`{ id, name, uuid, ... }`), and the
 * player-chat argument is `{ name, id: player.id, type: 'playerChat' }`. `MessageText`'s declared type
 * (`string | (string | number)[]`) doesn't capture these object fragments, so this walks the actual
 * runtime shape rather than the declared one.
 *
 * Scrubbing replaces any object carrying a `name` — both shapes above — with that `name` string alone,
 * recursing through arrays and the `{ alert: { ... } }` wrapper. The result contains neither a `uuid` nor
 * a player/user id anywhere.
 */
function scrubValue(value: unknown): IScrubbedMessageValue {
    if (Array.isArray(value)) {
        return value.map((element) => scrubValue(element));
    }

    if (value != null && typeof value === 'object') {
        if ('alert' in value) {
            const alert = (value as { alert: { type: string; message: unknown } }).alert;
            return { alert: { type: alert.type, message: scrubValue(alert.message) } };
        }

        if ('name' in value && typeof (value as { name: unknown }).name === 'string') {
            return (value as { name: string }).name;
        }

        // Defensive fallback: every object fragment this format actually produces carries a `name`, but a
        // fixed token replaces an unrecognized one rather than `JSON.stringify`-ing it. Stringifying does
        // not remove a `uuid`/`id` the object carries -- it preserves both as text inside the resulting
        // string, defeating the guarantee this function exists to establish. `IScrubbedMessageValue` has no
        // generic-object variant, so a fixed string is also the only representable degrade here.
        return '[redacted]';
    }

    return value as IScrubbedMessageValue;
}

export function scrubChatMessages(messages: readonly ISerializedMessage[]): ISavedChatMessage[] {
    return messages.map((message) => ({
        date: message.date.toISOString(),
        message: scrubValue(message.message),
    }));
}
