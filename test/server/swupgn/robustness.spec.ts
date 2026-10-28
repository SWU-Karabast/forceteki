import * as fs from 'fs';
import * as path from 'path';
import { parse } from '../../../swupgn/src/parse';
import { fold, stateAt } from '../../../swupgn/src/fold';
import { checkKeyframes } from '../../../swupgn/src/integrity';
import { render } from '../../../swupgn/src/render';
import { linkActionSteps } from '../../../swupgn/src/actionLinks';
import type { GameEvent, SwuPgnDocument } from '../../../swupgn/src/types';

/**
 * A file is untrusted input: no record a hand-edited or hostile file can hold may make the reader
 * throw. This corrupts every field of one sample of every event type the vectors contain, and
 * every field of each vector's fullest keyframe, one field at a time, and runs the result through
 * every entry point. Only values JSON can express are used: an array hole cannot come out of a
 * file, so deleting an array entry is not tried.
 */

const dir = path.resolve(__dirname, '../../../../swupgn/test-vectors');
const docs: SwuPgnDocument[] = fs.readdirSync(dir).filter((f) => f.endsWith('.swupgn'))
    .sort()
    .map((f) => parse(fs.readFileSync(path.join(dir, f), 'utf8')));

const BAD: unknown[] = [undefined, null, 5, -1, 'x', '__proto__', true, {}, []];

/** Every reader entry point, on `events`; the name of the first one that throws, with its message. */
function firstThrow(doc: SwuPgnDocument, events: GameEvent[]): string | null {
    const last = events[events.length - 1]?.seq ?? '';
    const calls: [string, () => unknown][] = [
        ['fold', () => fold(events)],
        ['checkKeyframes', () => checkKeyframes(events)],
        ['stateAt', () => stateAt(events, last)],
        ['render', () => render({ ...doc, events })],
        ['linkActionSteps', () => linkActionSteps(events)],
    ];
    for (const [name, call] of calls) {
        try {
            call();
        } catch (err) {
            return `${name}: ${(err as Error).message}`;
        }
    }
    return null;
}

/**
 * A copy of `obj` with the field at `keyPath` removed (`undefined`) or set to `value`, or null when
 * the removal would leave an array hole, which no JSON text can produce.
 */
function corrupt<T>(obj: T, keyPath: string[], value: unknown): T | null {
    const copy = JSON.parse(JSON.stringify(obj));
    let o = copy;
    for (const k of keyPath.slice(0, -1)) {
        o = o[k];
    }
    const last = keyPath[keyPath.length - 1];
    if (value === undefined) {
        if (Array.isArray(o)) {
            return null;
        }
        Reflect.deleteProperty(o, last);
    } else {
        o[last] = value;
    }
    return copy;
}

/** Every key path under `obj`, objects and arrays included, `depth` levels down. */
function paths(obj: unknown, depth: number, prefix: string[] = []): string[][] {
    if (depth === 0 || typeof obj !== 'object' || obj === null) {
        return [];
    }
    return Object.keys(obj).flatMap((k) => [[...prefix, k], ...paths((obj as any)[k], depth - 1, [...prefix, k])]);
}

describe('reader robustness against corrupted records', function () {
    // Value: protects=no corrupted field of any event type makes any reader entry point throw; fails_when=a handler dereferences a field it never checked, as DEPLOY_LEADER did with prev.epicActionUsed; why_new=the hostile-input tests elsewhere each cover one hand-picked field; seam=none; no_claim=the folded board for a corrupted record is not asserted, only that reading it is safe
    it('survives every event field removed or set to a wrong type', function () {
        const samples = new Map<string, { doc: SwuPgnDocument; e: GameEvent }>();
        for (const doc of docs) {
            for (const e of doc.events) {
                if (!samples.has(e.t)) {
                    samples.set(e.t, { doc, e });
                }
            }
        }
        expect(samples.size).withContext('the vectors cover the event types')
            .toBeGreaterThan(30);
        const failures: string[] = [];
        for (const [t, { doc, e }] of samples) {
            for (const key of Object.keys(e).filter((k) => k !== 't' && k !== 'keyframe')) {
                for (const bad of BAD) {
                    const thrown = firstThrow(doc, [corrupt(e, [key], bad) as GameEvent]);
                    if (thrown) {
                        failures.push(`${t}.${key}=${JSON.stringify(bad)} -> ${thrown}`);
                    }
                }
            }
        }
        expect(failures).toEqual([]);
    });

    // Value: protects=no corrupted keyframe field makes any reader entry point throw; fails_when=isCompleteKeyframe misses a field a consumer iterates, as it missed a card's captured; why_new=the keyframe trust-boundary tests cover upgrades, statusTokens and the list caps by hand; seam=none; no_claim=whether the corrupted keyframe is snapped to or ignored is the trust-boundary tests' job
    it('survives every keyframe field removed or set to a wrong type', function () {
        const failures: string[] = [];
        for (const doc of docs) {
            const withKeyframe = doc.events.filter((e: any) => e.keyframe);
            const fullest = withKeyframe.reduce((a: any, b: any) => (JSON.stringify(b.keyframe).length > JSON.stringify(a.keyframe).length ? b : a)) as any;
            const at = doc.events.indexOf(fullest);
            for (const keyPath of paths(fullest.keyframe, 6)) {
                for (const bad of BAD) {
                    const keyframe = corrupt(fullest.keyframe, keyPath, bad);
                    if (keyframe === null) {
                        continue;
                    }
                    const events = [...doc.events.slice(0, at), { ...fullest, keyframe }, ...doc.events.slice(at + 1)];
                    const thrown = firstThrow(doc, events);
                    if (thrown) {
                        failures.push(`${doc.header.gameId} ${fullest.seq} ${keyPath.join('.')}=${JSON.stringify(bad)} -> ${thrown}`);
                    }
                }
            }
        }
        expect(failures).toEqual([]);
    });
});
