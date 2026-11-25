import type { ISerializedMessage } from '../../../server/game/Interfaces';

/**
 * One line of a lobby or game chat, read the way a player sees it. The server sends each line as a list
 * of parts (strings, plus summaries of the players and cards it names); this flattens them to text so a
 * spec can assert on what was said rather than search the serialized payload.
 */
export interface IChatEntry {

    /** For a player's chat message, the id of the player who sent it. Absent for game log lines and alerts. */
    senderId?: string;

    /** For an alert, its type (for example `notification` or `warning`). Absent otherwise. */
    alertType?: string;

    /**
     * For a player's chat message, what they wrote. Otherwise the whole line, with each player or card it
     * names shown by name.
     */
    text: string;

    /**
     * The ids of the players the line names as player parts, in order. `text` shows each of them by name, but a
     * client can show them by seat instead to someone who should not see names. A name written into the text
     * itself appears in `text` without an id here, and cannot be hidden.
     */
    playerIds: string[];
}

/** The marker the server puts first in a player's chat message (`GameChat.addChatMessage`). */
const playerChatMarker = 'playerChat';

/** The type of a part naming a player (`ChatObjectType.Player`). */
const playerPartType = 'player';

function render(part: unknown): string {
    if (typeof part === 'string') {
        return part;
    }
    if (typeof part === 'number') {
        return String(part);
    }
    if (Array.isArray(part)) {
        return part.map(render).join('');
    }
    if (part !== null && typeof part === 'object') {
        if (typeof (part as { name?: unknown }).name === 'string') {
            return (part as { name: string }).name;
        }
        if ('message' in part) {
            return render((part as { message: unknown }).message);
        }
    }

    return '';
}

function playerIdsIn(part: unknown): string[] {
    if (Array.isArray(part)) {
        return part.flatMap(playerIdsIn);
    }
    if (part !== null && typeof part === 'object') {
        const { type, id, message } = part as { type?: unknown; id?: unknown; message?: unknown };
        if (type === playerPartType && typeof id === 'string') {
            return [id];
        }
        if (message !== undefined) {
            return playerIdsIn(message);
        }
    }

    return [];
}

function toChatEntry(serialized: ISerializedMessage): IChatEntry {
    const message: unknown = serialized?.message;

    if (message !== null && typeof message === 'object' && 'alert' in message) {
        const alert = (message as { alert: { type: string; message: unknown } }).alert;
        return { alertType: alert.type, text: render(alert.message), playerIds: playerIdsIn(alert.message) };
    }

    if (Array.isArray(message) && message[0]?.type === playerChatMarker) {
        // the server formats a chat message as '{0} {1}': the sender, a space, then what they wrote
        const said = message.slice(1);
        return { senderId: message[0].id, text: render(said).replace(/^ /, ''), playerIds: playerIdsIn(said) };
    }

    return { text: render(message), playerIds: playerIdsIn(message) };
}

/** Reads a chat's serialized messages (`lobbystate.gameChat.messages`, or `gamestate.newMessages`) as entries. */
export function toChatEntries(messages: readonly ISerializedMessage[] | undefined): IChatEntry[] {
    return (messages ?? []).map(toChatEntry);
}
