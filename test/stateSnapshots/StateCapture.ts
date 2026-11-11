// The engine's record of what it sends each player. A capture spec sets up a board the way a card
// spec does, then saves `game.getState()` at the moments a client would receive a state:
//
// - `captureState` saves one board for the participants named, as `render/<name>.<participant>.json`.
//   Render snapshots are for checking that a client draws a board correctly.
// - `captureChain` saves a sequence of states for one participant, each with the messages that
//   participant sent to move on to the next, as `controls/<name>.json`. Control snapshots are for
//   checking that a client sends the right message when clicked.
//
// `npm run capture-states -- --update` writes the snapshots; `--check` (what CI runs) fails when
// the engine no longer produces exactly what is committed. Clients fetch these files at a given
// commit to test their board against; nothing here knows about any client.

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { SnapshotRun } from './SnapshotRun';

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
 * the game registers (`GameStateManager.register`). Lists the names the `getGameObjectName()`
 * overrides return; add one here if a new override's objects reach the state. Matching only these
 * names leaves look-alikes such as set codes (`SOR_210`) alone.
 */
const GameObjectIdPattern = /\b(?:Card|Player|Zone|GameObject|StateWatcherRegistrar|StateWatcher_[A-Za-z0-9]+)_\d+\b/g;

/** Fields left out because they change between runs without the board changing, or are chat. */
const DroppedKeys = new Set(['newMessages', 'messageOffset', 'totalMessages']);

let firstPrintings: Map<string, unknown>;

/**
 * Each card's first printing, by card id. The engine sends a card's newest printing as its
 * `setId`, which changes whenever a card is reprinted; its first printing never does. `get-cards`
 * lists a card's printings in `setCodes` with the first printing first.
 */
const firstPrinting = (cardId: string): unknown => {
    if (!firstPrintings) {
        const cardDir = join(process.cwd(), 'test', 'json', 'Card');
        firstPrintings = new Map();
        for (const file of readdirSync(cardDir)) {
            const card = JSON.parse(readFileSync(join(cardDir, file), 'utf8'));
            if (card.setCodes?.length > 0) {
                firstPrintings.set(card.id, card.setCodes[0]);
            }
        }
    }
    return firstPrintings.get(cardId);
};

/**
 * Makes a state the same on every run and every machine:
 * - generated uuids become `uuid-1`, `uuid-2`, … in order of first appearance, so a uuid has the
 *   same name throughout a file, and a message in a chain names the same prompt as the state it
 *   answers;
 * - game object ids become `Card-1`, `Card-2`, … the same way. The engine numbers them by creation
 *   order across every object it registers, most of which never reach the state, so an engine
 *   change that creates one more object would otherwise renumber the snapshot without the board
 *   changing. The hyphen marks a name as the snapshot's, never an id the engine made;
 * - a card's `setId` becomes its first printing, so a reprint doesn't change the snapshot;
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

    const objectIds = new Map<string, string>();
    const stableObjectId = (id: string) => {
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
            if ('setId' in result && typeof result.id === 'string') {
                result.setId = firstPrinting(result.id) ?? result.setId;
            }
            return result;
        }
        return child;
    };

    return visit(value);
};

/** A snapshot's file contents. Round-tripped through JSON first, as the socket does to a state. */
const serialize = (value: unknown) => JSON.stringify(normalize(JSON.parse(JSON.stringify(value))), null, 2) + '\n';

/**
 * Saves the state each named participant would be sent right now, as
 * `test/stateSnapshots/render/<name>.<participant>.json`.
 *
 * Reading a state moves that participant's chat and animation cursors on, just as sending it
 * does, so call this at the moments a client would actually receive a state.
 */
export const captureState = (game: CapturedGame, name: string, participants: Participant[]) => {
    const run = SnapshotRun.get();
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
 * Starts a chain saved as `test/stateSnapshots/controls/<name>.json`. Call `step(participant)` at
 * each moment that participant receives a state; every message they send before the next step is
 * recorded as that step's `send`. Call `save()` after the last step, which sends nothing.
 *
 * The messages are recorded from the game commands the test harness calls, which are the ones
 * `Lobby` calls for a client's `game` socket message, so each `send` is exactly what moved the
 * engine on to the next state.
 */
export const captureChain = (game: CapturedGame, name: string) => {
    const run = SnapshotRun.get();
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
