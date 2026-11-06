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

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

export enum CaptureMode {
    Check = 'check',
    Update = 'update',
}

/** Where the committed snapshots live, relative to the repo root (capture runs from there). */
export const SnapshotRoot = join(process.cwd(), 'test', 'stateSnapshots');

/** The participants a state can be captured for, and the id each is read with. */
const Participants = {
    player1: '111',
    player2: '222',
    spectator: 'spectator',
};

export type Participant = keyof typeof Participants;

/** The game commands a client sends on the `game` socket event that drive a prompt forward. */
const RecordedCommands = ['cardClicked', 'menuButton', 'perCardMenuButton', 'statefulPromptResults'] as const;

type RecordedCommand = typeof RecordedCommands[number];

/** A message as the client sends it: `socket.emit('game', command, ...args)`. */
type GameMessage = [RecordedCommand, ...unknown[]];

/** The parts of `Game` a capture reads and, for a chain, listens to. */
type CapturedGame = { getState: (participantId: string) => unknown } & Record<RecordedCommand, (playerId: string, ...args: unknown[]) => unknown>;

const UuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** Fields left out because they change between runs without the board changing, or are chat. */
const DroppedKeys = new Set(['newMessages', 'messageOffset', 'totalMessages']);

export const captureMode = (): CaptureMode | null => {
    const mode = process.env.CAPTURE_STATES;
    return mode === CaptureMode.Check || mode === CaptureMode.Update ? mode : null;
};

/** Every snapshot file written or checked in this run, so the report can find stale ones. */
export const capturedFiles = new Set<string>();

/** Mismatches found in check mode, reported together at the end of the run. */
export const mismatches: string[] = [];

/**
 * Replaces values that differ between runs with stable ones. Generated uuids become `uuid-1`,
 * `uuid-2`, … in order of first appearance, so a uuid has the same name throughout a file: a
 * message in a chain names the same prompt as the state it answers.
 */
const normalize = (value: unknown): unknown => {
    const uuids = new Map<string, string>();
    const stableUuid = (uuid: string) => {
        if (!uuids.has(uuid)) {
            uuids.set(uuid, `uuid-${uuids.size + 1}`);
        }
        return uuids.get(uuid);
    };

    const visit = (child: unknown): unknown => {
        if (typeof child === 'string') {
            return child.replace(UuidPattern, stableUuid);
        }
        if (Array.isArray(child)) {
            return child.map(visit);
        }
        if (child && typeof child === 'object') {
            const result: Record<string, unknown> = {};
            for (const [key, grandchild] of Object.entries(child)) {
                if (!DroppedKeys.has(key)) {
                    result[key.replace(UuidPattern, stableUuid)] = visit(grandchild);
                }
            }
            return result;
        }
        return child;
    };

    return visit(value);
};

const assertCapturing = (): CaptureMode => {
    const mode = captureMode();
    if (!mode) {
        throw new Error('state capture runs only under `npm run capture-states`');
    }
    return mode;
};

/** Writes or checks one snapshot file, at `relativePath` under the snapshot root. */
const recordSnapshot = (mode: CaptureMode, relativePath: string, content: unknown) => {
    if (capturedFiles.has(relativePath)) {
        throw new Error(`state snapshot ${relativePath} is captured twice; give each capture its own name`);
    }
    capturedFiles.add(relativePath);

    const path = join(SnapshotRoot, relativePath);
    const actual = JSON.stringify(normalize(content), null, 2) + '\n';
    if (mode === CaptureMode.Update) {
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, actual);
    } else if (!existsSync(path)) {
        mismatches.push(`${relativePath}: missing`);
    } else if (readFileSync(path, 'utf8') !== actual) {
        mismatches.push(`${relativePath}: differs from what the engine sends`);
    }
};

/**
 * Saves the state each named participant would be sent right now, as
 * `test/stateSnapshots/render/<name>.<participant>.json`.
 *
 * Reading a state moves that participant's chat and animation cursors on, just as sending it
 * does, so call this at the moments a client would actually receive a state.
 */
export const captureState = (game: CapturedGame, name: string, participants: Participant[]) => {
    const mode = assertCapturing();
    for (const participant of participants) {
        recordSnapshot(mode, `render/${name}.${participant}.json`, game.getState(Participants[participant]));
    }
};

interface IChainStep {
    participant: Participant;
    state: unknown;
    send: GameMessage[];
}

/**
 * Starts a chain saved as `test/stateSnapshots/controls/<name>.json`. Call `step(participant)` at
 * each moment that participant receives a state; every message they send before the next step is
 * recorded as that step's `send`. Call `save()` after the last step.
 *
 * The messages are recorded from the game commands the test harness calls, which are the ones
 * `Lobby` calls for a client's `game` socket message, so each `send` is exactly what moved the
 * engine on to the next state.
 */
export const captureChain = (game: CapturedGame, name: string) => {
    const mode = assertCapturing();
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
            step.send.push([command, ...args]);
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
            recordSnapshot(mode, `controls/${name}.json`, { steps });
        },
    };
};
