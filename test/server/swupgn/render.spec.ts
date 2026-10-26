import { render } from '../../../swupgn/src/render';
import { parse } from '../../../swupgn/src/parse';
import * as fs from 'fs';
import * as path from 'path';

const text = fs.readFileSync(path.resolve(__dirname, '../../../../swupgn/test-vectors/minimal.swupgn'), 'utf8');

describe('render', function () {
    it('renders a round banner, a phase banner and numbered top-level actions', function () {
        const out = render(parse(text), { nameOf: (id) => id });   // identity name resolver
        expect(out).toContain('ROUND 1');
        expect(out).toContain('── action ──');
        expect(out).toMatch(/1\. Player 1 plays SOR#108/);
    });

    it('indents consequences under the numbered action they belong to', function () {
        const out = render(parse(text), { nameOf: (id) => id });
        // The DAMAGE caused by action 2 is indented under it, not numbered itself. The
        // seq scheme already groups them (R1.A.2 -> R1.A.2a); the indent shows it.
        expect(out).toMatch(/1\. Player 1 attacks[^\n]*\n {7}↳ 4 damage to Player 2's base/);
    });

    it('uses the document\'s own CARDS index when no resolver is given', function () {
        // The whole point of the index: a file is readable with no external card database.
        const out = render(parse(text));
        expect(out).toContain('Player 1 plays Wampa to ground');
        expect(out).not.toContain('SOR#108');
    });

    it('shows the board from the round keyframe', function () {
        const out = render(parse(text));
        expect(out).toContain('P1  base 30/30   hand 1   resources 2/2   deck 2   leader ready');
        expect(out).toContain('initiative: Player 1');
    });
});

describe('render base phrasing', function () {
    const nm = { nameOf: (id: string) => id };
    it('names the relevant player base on DAMAGE/OVERWHELM/HEAL', function () {
        const events = [
            { seq: 'R1.A.1a', t: 'DAMAGE', src: 'SOR#108', tgt: 'base@2', amt: 2, damageType: 'combat', hp: 28 },
            { seq: 'R1.A.1b', t: 'OVERWHELM', p: 1, tgt: 'base@2', amt: 3, hp: 25 },
            { seq: 'R1.A.2a', t: 'HEAL', tgt: 'base@1', amt: 1, hp: 30 },
        ];
        const out = render({ header: {} as any, decks: [], setup: [], events: events as any, annotations: [] }, nm);
        expect(out).toContain('2 damage to Player 2\'s base — 28 HP left');
        expect(out).toContain('3 Overwhelm damage to Player 2\'s base — 25 HP left');
        expect(out).toContain('1 healed on Player 1\'s base — 30 HP left');
    });
});

describe('render attachments and captures', function () {
    const nm = { nameOf: (id: string) => ({ 'LOF#164': 'Wampa', 'LOF#215': 'Ascension Cable', 'SOR#095': 'Battlefield Marine', 'JTL#058': 'Academy Graduate', 'LAW#253': 'Alliance X-Wing' }[id] ?? id) };
    const doc = (events: any[], cards: any[] = []) => ({ header: {} as any, decks: [], setup: [], events, annotations: [], cards });

    it('names the host of a played upgrade and a leader deployed as a pilot', function () {
        const out = render(doc([
            { seq: 'R1.A.1', t: 'PLAY_UPGRADE', p: 1, card: 'LOF#215', zone: 'ground', target: 'LOF#164', cost: 2 },
            { seq: 'R1.A.2', t: 'DEPLOY_LEADER', p: 1, card: 'JTL#058', kind: 'upgrade', target: 'LAW#253' },
            { seq: 'R1.A.3', t: 'DEPLOY_LEADER', p: 2, card: 'SOR#095' },
        ]), nm);
        expect(out).toContain('Player 1 plays Ascension Cable on Wampa (cost 2)');
        expect(out).toContain('Player 1 deploys Academy Graduate as a pilot on Alliance X-Wing');
        expect(out).toContain('Player 2 deploys Battlefield Marine');
    });

    it('says who captured what with which unit, and shows a held card on the board', function () {
        const out = render(doc([
            { seq: 'R1.A.2b', t: 'CAPTURE', p: 1, card: 'SOR#095', by: 'LOF#164' },
            { seq: 'R1.A.3b', t: 'RESCUE', p: 2, card: 'SOR#095' },
        ]), nm);
        expect(out).toContain('Player 1 captures Battlefield Marine with Wampa');
        expect(out).toContain('Player 2 rescues Battlefield Marine');
        const board = render(doc([{ seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: { round: 2, phase: 'action', initiative: 1, players: {
            1: { seat: 1, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [],
                cards: [{ id: 'LOF#164', zone: 'ground', damage: 0, exhausted: false, upgrades: ['LOF#215'], shields: 0, experience: 0, statusTokens: {}, captured: ['SOR#095'] }] },
            2: { seat: 2, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] },
        } } }]), nm);
        expect(board).toContain('ground: Wampa [Ascension Cable, holds Battlefield Marine]');
    });

    it('shows a card a base holds captured (Arrest) on the base line', function () {
        const out = render(doc([{ seq: 'R1.A.2b', t: 'CAPTURE', p: 1, card: 'SOR#095', by: 'base@1' }]), nm);
        expect(out).toContain('Player 1 captures Battlefield Marine with');
        const board = render(doc([{ seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: { round: 2, phase: 'action', initiative: 1, players: {
            1: { seat: 1, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [],
                cards: [], baseUpgrades: ['LOF#215'], baseCaptured: ['SOR#095'] },
            2: { seat: 2, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] },
        } } }]), nm);
        expect(board).toContain('base: Ascension Cable  ·  holds Battlefield Marine');
    });

    it('prints nothing for the resource counters: mechanism, not story', function () {
        const out = render(doc([
            { seq: 'R1.A.0a', t: 'EXHAUST_RESOURCES', p: 1, amount: 2 },
            { seq: 'R1.G.1', t: 'READY_RESOURCES', p: 1, amount: 1 },
        ]), nm);
        expect(out.trim()).toBe('');
    });
});

// UNDO folds to nothing, but a reader still has to know a retraction happened, so it prints as
// its own marker line rather than as a numbered action or an indented consequence.
describe('render undo marker', function () {
    const nm = { nameOf: (id: string) => id };
    const doc = (events: any[]) => ({ header: {} as any, decks: [], setup: [], events, annotations: [] });

    it('prints a marker naming who undid and where, without numbering it', function () {
        const out = render(doc([
            { seq: 'R1.A.1', t: 'PASS', p: 2 },
            { seq: 'R1.A.1-undo', t: 'UNDO', at: 'R1.A.1', by: 1 },
            { seq: 'R1.A.1', t: 'PASS', p: 2 },
        ]), nm);
        expect(out).toContain('·· Player 1 undid back to R1.A.1 ··');
        // Not numbered, and not indented as a consequence of the pass above it.
        expect(out).not.toMatch(/\d+\.\s*·· Player 1/);
        expect(out).not.toMatch(/↳.*undid/);
    });

    it('falls back to a neutral phrase when the undoing player is unknown', function () {
        const out = render(doc([
            { seq: 'R1.A.1-undo', t: 'UNDO', at: 'R1.A.1' },
        ]), nm);
        expect(out).toContain('·· A player undid back to R1.A.1 ··');
    });
});

// A leader whose other side has another name (CardIndexRecord.backSideName) is named by the side
// that is up: the renderer tracks it from the records that turn the card over.
describe('render card sides and granted abilities', function () {
    const cards = [
        { id: 'HMW#004', name: 'Grand Moff Tarkin, Tyrant of the Outer Rim', backSideName: 'The Death Star, Icon of Tyranny' },
        { id: 'TWI#017', name: 'Chancellor Palpatine, Playing Both Sides', backSideName: 'Darth Sidious' },
        { id: 'HMW#147', name: 'Beast Lair' },
    ];
    const doc = (events: any[]) => ({ header: {} as any, decks: [], setup: [], events, annotations: [], cards } as any);
    const p = (seat: 1 | 2, leader: Record<string, unknown>) => ({ seat, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [],
        resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [], leader });
    const linesOf = (out: string) => out.split('\n').map((l) => l.trim());

    // Value: protects=shown side via deploy/home MOVE/re-entry/LEADER_FLIP/keyframe, (granted by) on triggered form; fails_when=a transition stops flipping name; why_new=engine pins deploy only; seam=none; no_claim=writer
    it('names a leader by the side that is up through deploy, going home, flips and keyframes', function () {
        const out = linesOf(render(doc([
            { seq: 'R1.A.1', t: 'DEPLOY_LEADER', p: 1, card: 'HMW#004', zone: 'space', epic: true },
            { seq: 'R1.A.2', t: 'ATTACK', p: 1, atk: 'HMW#004', def: 'base', defenderType: 'base' },
            // Defeated: the Leader Unit goes home and shows its front again.
            { seq: 'R1.A.2a', t: 'MOVE', card: 'HMW#004', from: 'space', to: 'base', p: 1, kind: 'unit' },
            { seq: 'R1.A.3', t: 'ABILITY_ACTIVATE', p: 1, card: 'HMW#004', kind: 'action' },
            // Leaving the base zone for an arena is a deploy, whatever record announced it.
            { seq: 'R1.A.3a', t: 'MOVE', card: 'HMW#004', from: 'base', to: 'space', p: 1, kind: 'unit' },
            { seq: 'R1.A.4', t: 'ABILITY_ACTIVATE', p: 1, card: 'HMW#004', kind: 'action' },
            { seq: 'R1.A.5', t: 'LEADER_FLIP', p: 2, card: 'TWI#017', onStartingSide: false },
            { seq: 'R1.A.6', t: 'ABILITY_ACTIVATE', p: 2, card: 'TWI#017', kind: 'action' },
            { seq: 'R1.A.7', t: 'LEADER_FLIP', p: 2, card: 'TWI#017', onStartingSide: true },
            // A keyframe snaps both: Tarkin undeployed (front), Palpatine flipped (back).
            { seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: { round: 2, phase: 'action', initiative: 1, players: {
                1: p(1, { id: 'HMW#004', deployed: false, exhausted: false, epicActionUsed: true }),
                2: p(2, { id: 'TWI#017', deployed: false, exhausted: false, epicActionUsed: false, onStartingSide: false }),
            } } },
            { seq: 'R2.A.1', t: 'ABILITY_ACTIVATE', p: 1, card: 'HMW#004', kind: 'action' },
            { seq: 'R2.A.2', t: 'ABILITY_ACTIVATE', p: 2, card: 'TWI#017', kind: 'action' },
        ])));
        const action = (n: number, text: string) => expect(out).withContext(`action ${n}`)
            .toContain(`${n}. ${text}`);
        action(1, 'Player 1 deploys Grand Moff Tarkin, Tyrant of the Outer Rim as The Death Star, Icon of Tyranny');
        action(2, 'Player 1 attacks Player 2\'s base with The Death Star, Icon of Tyranny');
        action(3, 'Player 1 uses Grand Moff Tarkin, Tyrant of the Outer Rim');
        action(4, 'Player 1 uses The Death Star, Icon of Tyranny');
        // A flip is a consequence (of the ability that flipped it), never a numbered action.
        expect(out).toContain('↳ Player 2 flips Chancellor Palpatine, Playing Both Sides to Darth Sidious');
        action(5, 'Player 2 uses Darth Sidious');
        expect(out).toContain('↳ Player 2 flips Darth Sidious to Chancellor Palpatine, Playing Both Sides');
        // Round 2 restarts the numbering after the keyframe.
        expect(out).toContain('1. Player 1 uses Grand Moff Tarkin, Tyrant of the Outer Rim');
        expect(out).toContain('2. Player 2 uses Darth Sidious');

        // A granted ability names its grantor on the triggered form too; a card's own ability and a
        // flip of a card with no other side carry no suffix.
        const granted = linesOf(render(doc([
            { seq: 'R1.A.0a', t: 'ABILITY_ACTIVATE', p: 1, card: 'base@1', kind: 'triggered', grantedBy: 'HMW#147' },
            { seq: 'R1.A.1', t: 'ABILITY_ACTIVATE', p: 1, card: 'HMW#147', kind: 'action' },
            { seq: 'R1.A.2', t: 'LEADER_FLIP', p: 1, card: 'HMW#147', onStartingSide: false },
        ])));
        expect(granted).toContain('↳ Player 1\'s base uses an ability (granted by Beast Lair)');
        expect(granted).toContain('1. Player 1 uses Beast Lair');
        expect(granted).toContain('↳ Player 1 flips Beast Lair');
    });
});
