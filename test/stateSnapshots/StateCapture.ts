// The engine's record of what it sends each player. A capture spec sets up a board the way a card
// spec does, then calls `captureState` to save `game.getState()` for both players and a spectator.
//
// `npm run capture-states -- --update` writes the snapshots; `--check` (what CI runs) fails when
// the engine no longer produces exactly what is committed. Clients copy these files to test their
// board against; nothing here knows about any client.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

export enum CaptureMode {
    Check = 'check',
    Update = 'update',
}

/** Where the committed snapshots live, relative to the repo root (capture runs from there). */
export const SnapshotRoot = join(process.cwd(), 'test', 'stateSnapshots');

/** The participants a state is captured for, and the id each is read with. */
const Participants: Record<string, string> = {
    player1: '111',
    player2: '222',
    spectator: 'spectator',
};

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
 * `uuid-2`, … in order of first appearance, so the same card keeps the same id across a file.
 */
const normalize = (state: unknown): unknown => {
    const uuids = new Map<string, string>();
    const stableUuid = (uuid: string) => {
        if (!uuids.has(uuid)) {
            uuids.set(uuid, `uuid-${uuids.size + 1}`);
        }
        return uuids.get(uuid);
    };

    const visit = (value: unknown): unknown => {
        if (typeof value === 'string') {
            return value.replace(UuidPattern, stableUuid);
        }
        if (Array.isArray(value)) {
            return value.map(visit);
        }
        if (value && typeof value === 'object') {
            const result: Record<string, unknown> = {};
            for (const [key, child] of Object.entries(value)) {
                if (!DroppedKeys.has(key)) {
                    result[stableUuidKey(key, stableUuid)] = visit(child);
                }
            }
            return result;
        }
        return value;
    };

    return visit(state);
};

const stableUuidKey = (key: string, stableUuid: (uuid: string) => string) => key.replace(UuidPattern, stableUuid);

const serialize = (state: unknown) => JSON.stringify(normalize(state), null, 2) + '\n';

/**
 * Saves the state each participant would be sent right now, as
 * `test/stateSnapshots/<name>.<participant>.json`. `name` is `<scenario>/<step>`.
 *
 * Reading a state moves that participant's chat and animation cursors on, just as sending it
 * does, so call this at the moments a client would actually receive a state.
 */
export const captureState = (game: { getState: (participantId: string) => unknown }, name: string) => {
    const mode = captureMode();
    if (!mode) {
        throw new Error('captureState runs only under `npm run capture-states`');
    }

    for (const [participant, id] of Object.entries(Participants)) {
        const relativePath = `${name}.${participant}.json`;
        const path = join(SnapshotRoot, relativePath);
        if (capturedFiles.has(relativePath)) {
            throw new Error(`state snapshot ${relativePath} is captured twice; give each capture its own name`);
        }
        capturedFiles.add(relativePath);

        const actual = serialize(game.getState(id));
        if (mode === CaptureMode.Update) {
            mkdirSync(dirname(path), { recursive: true });
            writeFileSync(path, actual);
        } else if (!existsSync(path)) {
            mismatches.push(`${relativePath}: missing`);
        } else if (readFileSync(path, 'utf8') !== actual) {
            mismatches.push(`${relativePath}: differs from what the engine sends`);
        }
    }
};
