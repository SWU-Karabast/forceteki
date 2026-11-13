// The engine's record of what it sends each player. A capture spec sets up a board the way a card
// spec does, then saves `game.getState()` at the moments a client would receive a state:
//
// - `captureState` saves one board for the participants named, as `render/<name>.<participant>.json`.
//   Render captures are for checking that a client draws a board correctly.
// - `captureChain` saves a sequence of states for one participant, each with the messages that
//   participant sent to move on to the next, as `controls/<name>.json`. Control captures are for
//   checking that a client sends the right message when clicked.
//
// `npm run capture-states -- --update` writes the captures; `--check` (what CI runs) fails when
// the engine no longer produces exactly what is committed. Clients fetch these files at a given
// commit to test their board against; nothing here knows about any client.

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { CaptureRun } from './CaptureRun';

/** The participants a state can be captured for, and the id each is read with. */
const Participants = {
    player1: '111',
    player2: '222',
    spectator: 'spectator',
};

export type Participant = keyof typeof Participants;

/**
 * The commands `Lobby` accepts on the `game` socket event (its `allowedGameCommands`), apart from
 * chat. A chain records every one of them, so no move between steps goes unrecorded.
 */
const RecordedCommands = [
    'cardClicked',
    'concede',
    'menuButton',
    'perCardMenuButton',
    'rollbackToSnapshot',
    'statefulPromptResults',
    'toggleOptionSetting',
] as const;

type RecordedCommand = typeof RecordedCommands[number];

/** A message as the client sends it: `socket.emit('game', command, ...args)`. */
type GameMessage = [RecordedCommand, ...unknown[]];

/** The parts of `Game` a capture reads and, for a chain, listens to. */
type CapturedGame = { getState: (participantId: string) => unknown } & Record<RecordedCommand, (playerId: string, ...args: unknown[]) => unknown>;

const UuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/**
 * A game object's id: `<getGameObjectName()>_<n>`, numbered by one counter shared by every object
 * the game registers (`GameStateManager.register`). Lists the `getGameObjectName()` names seen in
 * a state so far; a capture whose state has an id of any other name fails, naming the one to add.
 * Matching only these names leaves look-alikes such as set codes (`SOR_210`) alone.
 */
const GameObjectIdPattern = /\b(?:Card|Player|Zone|GameObject|StateWatcherRegistrar|StateWatcher_[A-Za-z0-9]+)_\d+\b/g;

/**
 * Anything still shaped like a game object id after normalizing: a word-style name (`OngoingEffectImpl`),
 * `_`, a number. Set codes (`SOR_210`) are all capitals, so they don't match.
 */
const MissedGameObjectIdPattern = /\b[A-Z][a-z]\w*_\d+\b/g;

/** Fields left out because they change between runs without the board changing, or are chat. */
const DroppedKeys = new Set(['newMessages', 'messageOffset', 'totalMessages']);

interface ISetId {
    set: string;
    number: number;
}

const isSetId = (value: unknown): value is ISetId =>
    typeof (value as ISetId)?.set === 'string' && typeof (value as ISetId)?.number === 'number';

const printingKey = (setId: ISetId) => `${setId.set} ${setId.number}`;

/** What normalizing reads from the card data `get-cards` downloads. */
interface ICardIndex {

    /** Each printing's first printing, keyed by `printingKey`. */
    firstPrintings: Map<string, ISetId>;

    /** Each card's internal name (`battlefield-marine`), by card id. */
    internalNames: Map<string, string>;
}

let cardIndex: ICardIndex;

const cards = (): ICardIndex => {
    if (!cardIndex) {
        cardIndex = { firstPrintings: new Map(), internalNames: new Map() };
        const cardDir = join(process.cwd(), 'test', 'json', 'Card');
        for (const file of readdirSync(cardDir)) {
            const card = JSON.parse(readFileSync(join(cardDir, file), 'utf8'));
            cardIndex.internalNames.set(card.id, card.internalName);
            for (const printing of card.setCodes ?? []) {
                cardIndex.firstPrintings.set(printingKey(printing), card.setCodes[0]);
            }
        }
    }
    return cardIndex;
};

/**
 * The first printing of the card printed as `setId`. The engine sends a card's newest printing as
 * its `setId`, which changes whenever a card is reprinted; its first printing never does. `get-cards`
 * lists a card's printings in `setCodes` with the first printing first. Keyed by printing rather than
 * card id, so a `setId` is normalized wherever it appears, with or without its card's id beside it.
 */
const firstPrinting = (setId: ISetId): ISetId | undefined => cards().firstPrintings.get(printingKey(setId));

/**
 * Names each card in `value` after itself: the card whose `uuid` is `Card_54` and whose `id` is
 * battlefield-marine's becomes `Card-battlefield-marine-1`, copies of one card numbered in the order
 * they appear. Collected before anything is renamed, since a card's id can appear before the card
 * does (in a chain's `send`, or a `parentCardId`).
 */
const nameCards = (value: unknown): Map<string, string> => {
    const names = new Map<string, string>();
    const copies = new Map<string, number>();
    const visit = (child: unknown) => {
        if (Array.isArray(child)) {
            child.forEach(visit);
        } else if (child && typeof child === 'object') {
            const { uuid, id } = child as Record<string, unknown>;
            const internalName = typeof id === 'string' ? cards().internalNames.get(id) : undefined;
            if (typeof uuid === 'string' && (/^Card_\d+$/).test(uuid) && internalName && !names.has(uuid)) {
                const copy = (copies.get(internalName) ?? 0) + 1;
                copies.set(internalName, copy);
                names.set(uuid, `Card-${internalName}-${copy}`);
            }
            Object.values(child).forEach(visit);
        }
    };
    visit(value);
    return names;
};

/**
 * Makes a state the same on every run and every machine:
 * - generated uuids become `uuid-1`, `uuid-2`, … in order of first appearance, so a uuid has the
 *   same name throughout a file, and a message in a chain names the same prompt as the state it
 *   answers;
 * - a card's id becomes its name, `Card-battlefield-marine-1` (see `nameCards`), and any other game
 *   object id becomes `Player-1`, `Zone-2`, … in order of first appearance. The engine numbers them by
 *   creation order across every object it registers, most of which never reach the state, so an
 *   engine change that creates one more object would otherwise renumber the capture without the
 *   board changing; and naming cards after themselves means adding a card to a board renames no
 *   other card. The hyphen marks a name as the capture's, never an id the engine made;
 * - a card's `setId` becomes its first printing, so a reprint doesn't change the capture;
 * - chat is left out.
 */
const normalize = (value: unknown): unknown => {
    const uuids = new Map<string, string>();
    const stableUuid = (uuid: string) => {
        if (!uuids.has(uuid)) {
            uuids.set(uuid, `uuid-${uuids.size + 1}`);
        }
        return uuids.get(uuid);
    };

    const cardNames = nameCards(value);
    const objectIds = new Map<string, string>();
    const stableObjectId = (id: string) => {
        if (cardNames.has(id)) {
            return cardNames.get(id);
        }
        if (!objectIds.has(id)) {
            objectIds.set(id, `${id.replace(/_\d+$/, '')}-${objectIds.size + 1}`);
        }
        return objectIds.get(id);
    };

    const stabilize = (text: string) => text.replace(UuidPattern, stableUuid).replace(GameObjectIdPattern, stableObjectId);

    const visit = (child: unknown): unknown => {
        if (typeof child === 'string') {
            return stabilize(child);
        }
        if (Array.isArray(child)) {
            return child.map(visit);
        }
        if (child && typeof child === 'object') {
            const result: Record<string, unknown> = {};
            for (const [key, grandchild] of Object.entries(child)) {
                if (!DroppedKeys.has(key)) {
                    result[stabilize(key)] = visit(grandchild);
                }
            }
            if (isSetId(result.setId)) {
                result.setId = firstPrinting(result.setId) ?? result.setId;
            }
            return result;
        }
        return child;
    };

    return visit(value);
};

/** A capture's file contents. Round-tripped through JSON first, as the socket does to a state. */
const serialize = (value: unknown) => {
    const content = JSON.stringify(normalize(JSON.parse(JSON.stringify(value))), null, 2) + '\n';

    // an id GameObjectIdPattern doesn't list would keep the engine's number and renumber silently
    const missedNames = new Set([...content.matchAll(MissedGameObjectIdPattern)].map(([id]) => id.replace(/_\d+$/, '')));
    if (missedNames.size > 0) {
        throw new Error(`state has game object ids that aren't normalized; add ${[...missedNames].join(', ')} to GameObjectIdPattern in StateCapture.ts`);
    }
    return content;
};

/**
 * Saves the state each named participant would be sent right now, as
 * `test/stateCaptures/render/<name>.<participant>.json`.
 *
 * Reading a state moves that participant's chat and animation cursors on, just as sending it
 * does, so call this at the moments a client would actually receive a state.
 */
export const captureState = (game: CapturedGame, name: string, participants: Participant[]) => {
    const run = CaptureRun.get();
    for (const participant of participants) {
        run.record(`render/${name}.${participant}.json`, serialize(game.getState(Participants[participant])));
    }
};

interface IChainStep {
    participant: Participant;
    state: unknown;
    send: GameMessage[];
}

/** Games with a chain recording, since a second chain would replace the first one's recorders. */
const gamesWithChain = new WeakSet<CapturedGame>();

/**
 * Starts a chain saved as `test/stateCaptures/controls/<name>.json`. Call `step(participant)` at
 * each moment that participant receives a state; every message they send before the next step is
 * recorded as that step's `send`. Call `save()` after the last step, which sends nothing.
 *
 * The messages are recorded from the game commands the test harness calls, which are the ones
 * `Lobby` calls for a client's `game` socket message, so each `send` is exactly what moved the
 * engine on to the next state.
 */
export const captureChain = (game: CapturedGame, name: string) => {
    const run = CaptureRun.get();
    if (gamesWithChain.has(game)) {
        throw new Error(`chain ${name}: this game already has a chain recording; save it first`);
    }
    gamesWithChain.add(game);

    const steps: IChainStep[] = [];
    const originals = RecordedCommands.map((command) => [command, game[command]] as const);

    for (const [command, original] of originals) {
        game[command] = (playerId: string, ...args: unknown[]) => {
            const step = steps[steps.length - 1];
            if (!step) {
                throw new Error(`chain ${name}: '${command}' was sent before the first step`);
            }
            if (Participants[step.participant] !== playerId) {
                throw new Error(`chain ${name}: '${command}' was sent by ${playerId}, but the step is ${step.participant}'s`);
            }

            // the harness passes arguments a client leaves off as undefined
            const sent = [...args];
            while (sent.length > 0 && sent[sent.length - 1] === undefined) {
                sent.pop();
            }
            step.send.push([command, ...sent]);

            return original.call(game, playerId, ...args);
        };
    }

    return {
        step: (participant: Participant) => {
            // copied now, so nothing the game does later can reach it
            const state = JSON.parse(JSON.stringify(game.getState(Participants[participant])));
            steps.push({ participant, state, send: [] });
        },
        save: () => {
            for (const [command, original] of originals) {
                game[command] = original;
            }
            gamesWithChain.delete(game);

            if (steps.length < 2) {
                throw new Error(`chain ${name}: a chain needs at least two steps, a state and the state its messages lead to`);
            }
            if (steps[steps.length - 1].send.length > 0) {
                throw new Error(`chain ${name}: messages were sent after the last step; take a step for the state they lead to`);
            }
            run.record(`controls/${name}.json`, serialize({ steps }));
        },
    };
};
