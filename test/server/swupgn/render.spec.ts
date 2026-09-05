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

    it('prints nothing for the resource counters: mechanism, not story', function () {
        const out = render(doc([
            { seq: 'R1.A.0a', t: 'EXHAUST_RESOURCES', p: 1, amount: 2 },
            { seq: 'R1.G.1', t: 'READY_RESOURCES', p: 1, amount: 1 },
        ]), nm);
        expect(out.trim()).toBe('');
    });
});
