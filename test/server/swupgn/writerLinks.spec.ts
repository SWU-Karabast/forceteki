import * as fs from 'fs';
import * as path from 'path';
import { parse } from '../../../swupgn/src/index';
import { isTopLevelActionRecord } from '../../../swupgn/src/actionLinks';
import type { GameEvent } from '../../../swupgn/src/types';

/**
 * `[W-18]`: a record that belongs to an action announced after it carries `for`. These guard
 * that the writer's vectors meet it, so a reader never has to guess which action owns a record.
 */

const root = path.resolve(__dirname, '../../../..');
const dir = path.join(root, 'swupgn/test-vectors');
const vectorFiles = fs.readdirSync(dir).filter((f) => f.endsWith('.swupgn'))
    .sort();
const eventsOf = (file: string): GameEvent[] => parse(fs.readFileSync(path.join(dir, file), 'utf8')).events;

const isTopLevelStep = (seq: string) => (/^R\d+\.[SAG]\.\d+$/).test(seq);

// The record types that can sit between an action's previous step and its announcement. An
// attack is announced after its target is picked and its attacker exhausts, and never moves a
// card or restates its stats first: a `STATS` naming the attacker just before an `ATTACK` is the
// previous action's consequence (homeworlds R4.A.2d, a Weakness token landing on the Beast that
// then attacks), and filing it under the attack would be wrong.
const PRE_ANNOUNCE = ['CHOICE', 'MODAL_CHOICE', 'EXHAUST', 'MOVE', 'STATS', 'EXHAUST_RESOURCES'];
const PRE_ATTACK = ['CHOICE', 'MODAL_CHOICE', 'EXHAUST'];

/** The card an action is about, or one of its records names: `card`, else `atk`. */
function cardOf(e: GameEvent): string | undefined {
    const any = e as { card?: unknown; atk?: unknown };
    if (typeof any.card === 'string') {
        return any.card;
    }
    return typeof any.atk === 'string' ? any.atk : undefined;
}

describe('SWU-PGN writer links', function () {
    it('stamps every record that precedes and names its action', function () {
        const missing: string[] = [];
        for (const file of vectorFiles) {
            const events = eventsOf(file);
            events.forEach((action, i) => {
                const card = cardOf(action);
                if (!isTopLevelActionRecord(action) || card == null) {
                    return;
                }
                const types = action.t === 'ATTACK' ? PRE_ATTACK : PRE_ANNOUNCE;
                for (let j = i - 1; j >= 0; j--) {
                    const e = events[j];
                    if (isTopLevelStep(e.seq) || !types.includes(e.t)) {
                        break;
                    }
                    if (cardOf(e) === card && e.for !== action.seq) {
                        missing.push(`${file} ${e.seq} ${e.t} (for ${action.seq} ${action.t})`);
                    }
                }
            });
        }
        expect(missing).toEqual([]);
    });

    it('adds links without moving any', function () {
        const rev3: Record<string, Record<string, string>> = JSON.parse(
            fs.readFileSync(path.join(root, 'test/server/swupgn/fixtures/for-links-rev3.json'), 'utf8')
        );
        const moved: string[] = [];
        for (const [file, links] of Object.entries(rev3)) {
            const now = new Map(eventsOf(file).map((e) => [e.seq, e.for]));
            for (const [seq, owner] of Object.entries(links)) {
                if (now.get(seq) !== owner) {
                    moved.push(`${file} ${seq}: was for ${owner}, now ${now.get(seq) ?? 'nothing'}`);
                }
            }
        }
        expect(moved).toEqual([]);
    });
});
