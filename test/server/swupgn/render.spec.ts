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

    // Value: protects=in a mirror match each copy of a leader is named by its own side (§16); fails_when=sides are tracked by printed id again, so one flip renames both; why_new=every side test used two different leaders; seam=none; no_claim=none beyond protects
    it('tracks each copy of a leader separately in a mirror match', function () {
        const out = linesOf(render(doc([
            { seq: 'R1.A.1', t: 'ABILITY_ACTIVATE', p: 1, card: 'TWI#017', kind: 'action' },
            { seq: 'R1.A.1a', t: 'LEADER_FLIP', p: 1, card: 'TWI#017', onStartingSide: false },
            { seq: 'R1.A.2', t: 'ABILITY_ACTIVATE', p: 2, card: 'TWI#017:2', kind: 'action' },
            { seq: 'R1.A.3', t: 'ABILITY_ACTIVATE', p: 1, card: 'TWI#017', kind: 'action' },
            { seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: { round: 2, phase: 'action', initiative: 1, players: {
                1: p(1, { id: 'TWI#017', deployed: false, exhausted: false, epicActionUsed: false, onStartingSide: true }),
                2: p(2, { id: 'TWI#017:2', deployed: false, exhausted: false, epicActionUsed: false, onStartingSide: false }),
            } } },
            { seq: 'R2.A.1', t: 'ABILITY_ACTIVATE', p: 1, card: 'TWI#017', kind: 'action' },
            { seq: 'R2.A.2', t: 'ABILITY_ACTIVATE', p: 2, card: 'TWI#017:2', kind: 'action' },
        ])));
        expect(out).toContain('2. Player 2 uses Chancellor Palpatine, Playing Both Sides #2');
        expect(out).toContain('3. Player 1 uses Darth Sidious');
        expect(out).toContain('1. Player 1 uses Chancellor Palpatine, Playing Both Sides');
        expect(out).toContain('2. Player 2 uses Darth Sidious #2');

        // A caller's own resolver keyed by printed id, which does not strip `:N` itself.
        const byId: Record<string, string> = { 'TWI#017': 'Chancellor Palpatine' };
        const plain = linesOf(render(doc([
            { seq: 'R1.A.1', t: 'ABILITY_ACTIVATE', p: 2, card: 'TWI#017:2', kind: 'action' },
            { seq: 'R1.A.1a', t: 'LEADER_FLIP', p: 2, card: 'TWI#017:2', onStartingSide: false },
            { seq: 'R1.A.2', t: 'ABILITY_ACTIVATE', p: 2, card: 'TWI#017:2', kind: 'action' },
            { seq: 'R1.A.3', t: 'ABILITY_ACTIVATE', p: 1, card: 'TWI#017', kind: 'action' },
        ]), { nameOf: (id) => byId[id] ?? id, backNameOf: (id) => (id === 'TWI#017' ? 'Darth Sidious' : undefined) }));
        expect(plain).toContain('2. Player 2 uses Darth Sidious #2');
        expect(plain).toContain('3. Player 1 uses Chancellor Palpatine');
    });
});

describe('render card lists', function () {
    const nm = { nameOf: (id: string) => ({ 'SOR#005': 'Leia Organa, These Are My Friends', 'SOR#049': 'Obi-Wan Kenobi, Protective Padawan', 'SOR#108': 'Wampa' }[id] ?? id) };
    const doc = (events: any[]) => ({ header: {} as any, decks: [], setup: [], events, annotations: [], cards: [] });

    // Value: protects=a list of card names can be split back into cards; fails_when=lists are joined with ", ", which every title-and-subtitle name also contains; why_new=no test rendered a list of subtitled cards; seam=none; no_claim=none
    it('separates cards with a middle dot, since a card name has its own comma', function () {
        const out = render(doc([
            { seq: 'R1.S.1', t: 'DRAW', p: 1, count: 3, cards: ['SOR#005', 'SOR#049', 'SOR#108'] },
            { seq: 'R1.A.1a', t: 'DISCARD', p: 2, cards: ['SOR#005', 'SOR#108'] },
        ]), nm);
        expect(out).toContain('Player 1 draws 3: Leia Organa, These Are My Friends · Obi-Wan Kenobi, Protective Padawan · Wampa');
        expect(out).toContain('Player 2 discards Leia Organa, These Are My Friends · Wampa');
    });

    // Value: protects=render survives a keyframe card whose captured is not a list; fails_when=the fold snaps to such a keyframe and render.ts iterates captured; why_new=no render test used a damaged keyframe; seam=none; no_claim=validate rejects the file
    it('does not throw on a keyframe card whose captured is not a list', function () {
        const seat = (n: 1 | 2, cards: unknown[]) => ({ seat: n, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards });
        const card = { id: 'SOR#108', zone: 'ground', damage: 0, exhausted: false, upgrades: [], shields: 0, experience: 0, statusTokens: {}, captured: 5 };
        expect(() => render(doc([{ seq: 'R1.start', t: 'ROUND_START', round: 1, keyframe: { round: 1, phase: 'action', initiative: 1, players: { 1: seat(1, [card]), 2: seat(2, []) } } }]), nm)).not.toThrow();
    });
});

describe('render effects', function () {
    const nm = { nameOf: (id: string) => ({ 'SOR#142': 'Bold Resistance', 'SOR#108': 'Wampa', 'SOR#095': 'Battlefield Marine' }[id] ?? id) };
    const doc = (events: any[]) => ({ header: {} as any, decks: [], setup: [], events, annotations: [], cards: [] });

    // Value: protects=the §16 wording of EFFECT_START / EFFECT_END; fails_when=either line drifts from the spec table; why_new=effects are new; seam=none; no_claim=board summary
    it('renders an effect start and end', function () {
        const out = render(doc([
            { seq: 'R1.A.1a', t: 'EFFECT_START', id: 'fx@1', src: 'SOR#142', p: 1, targets: ['SOR#108', 'SOR#095'], duration: 'phase', text: '+2/+0' },
            { seq: 'R1.A.1b', t: 'EFFECT_START', id: 'fx@2', src: 'SOR#142', p: 2, seat: 1, duration: 'until', untilText: 'Player 1 plays a unit' },
            { seq: 'R1.A.1c', t: 'EFFECT_START', id: 'fx@3', src: 'SOR#108', p: 1, targets: ['base@2'], duration: 'whileSourceInPlay' },
            { seq: 'R1.A.2a', t: 'EFFECT_END', id: 'fx@1', reason: 'targetLeft', targets: ['SOR#095'] },
            { seq: 'R1.A.2b', t: 'EFFECT_END', id: 'fx@2', reason: 'fired' },
            { seq: 'R1.A.2c', t: 'EFFECT_END', id: 'fx@9', reason: 'expired' },
        ]), nm).split('\n');
        expect(out).toEqual([
            '       ↳ Player 1: Bold Resistance — +2/+0 on Wampa · Battlefield Marine (for this phase)',
            '       ↳ Player 2: Bold Resistance for Player 1 (until Player 1 plays a unit)',
            '       ↳ Player 1: Wampa on Player 2\'s base (while Wampa is in play)',
            '       ↳ Effect from Bold Resistance ends on Battlefield Marine (its target changed zone)',
            '       ↳ Effect from Bold Resistance ends (it resolved)',
            '       ↳ Effect fx@9 ends (expired)',
        ]);
    });

    // Value: protects=icon markup in EFFECT_START.text never reaches the plain-text story (§16); fails_when=text is printed raw; why_new=fix round 1; seam=none; no_claim=none
    it('prints an effect text\'s icon markup as plain text', function () {
        const out = render(doc([
            { seq: 'R1.A.1a', t: 'EFFECT_START', id: 'fx@1', src: 'SOR#142', p: 1, targets: ['SOR#108'], duration: 'phase',
                text: 'gains {keyword:sentinel} and {keyword:raid:2}, costs {resource:1} less, :aggression::heroism:' },
        ]), nm);
        expect(out).toBe('       ↳ Player 1: Bold Resistance — gains Sentinel and Raid 2, costs 1 resource less, Aggression Heroism on Wampa (for this phase)');
    });

    // Value: protects=a player-wide effect on both players reads as one (§10.1 seat, §16); fails_when=seat both prints nothing or a seat; why_new=final review item 15; seam=none; no_claim=none
    it('renders an effect on both players', function () {
        const out = render(doc([
            { seq: 'R1.A.1a', t: 'EFFECT_START', id: 'fx@1', src: 'SOR#142', p: 1, seat: 'both', duration: 'phase' },
        ]), nm);
        expect(out).toBe('       ↳ Player 1: Bold Resistance for both players (for this phase)');
    });

    // Value: protects=an effect's text and untilText are cut like a card name, so a file cannot grow the story (§16, §23); fails_when=either is printed in full; why_new=final review: NAME was cut and these were not; seam=none; no_claim=none
    it('cuts a long effect text and untilText as it cuts a card name', function () {
        const out = render(doc([
            { seq: 'R1.A.1a', t: 'EFFECT_START', id: 'fx@1', src: 'SOR#142', p: 1, targets: ['SOR#108'], duration: 'until',
                text: 't'.repeat(200), untilText: 'u'.repeat(200) },
        ]), nm);
        expect(out).toBe(`       ↳ Player 1: Bold Resistance — ${'t'.repeat(119)}… on Wampa (until ${'u'.repeat(119)}…)`);
    });

    // Value: protects=one record is one story line (§16 strict layout, R-04); fails_when=a line break in text, untilText or a name reaches the story; why_new=ship review: only length was cut; seam=none; no_claim=bidi controls beyond the listed ones
    it('keeps an effect\'s text, untilText and a named card on one line', function () {
        const out = render(doc([
            { seq: 'R1.A.1a', t: 'EFFECT_START', id: 'fx@1', src: 'SOR#142', p: 1, targets: ['SOR#108'], duration: 'until',
                text: '+1/+0\nnext', untilText: 'it\r\nattacks' },
            { seq: 'R1.A.1b', t: 'NAME', p: 1, name: 'Wampa\u2028Battlefield Marine' },
        ]), nm);
        expect(out.split('\n')).toEqual([
            '       ↳ Player 1: Bold Resistance — +1/+0 next on Wampa (until it  attacks)',
            '       ↳ Player 1 names Wampa Battlefield Marine',
        ]);
    });

    // Value: protects=an id the cards index does not list is cut like a card name wherever the story names it (§16 nm); fails_when=the raw id is printed in full; why_new=ship review: EFFECT_END names its effect's source; seam=none; no_claim=none
    it('cuts an unlisted id like a card name, on the start and the end of an effect', function () {
        const src = `X#${'9'.repeat(200)}`;
        const out = render(doc([
            { seq: 'R1.A.1a', t: 'EFFECT_START', id: 'fx@1', src, p: 1, seat: 1, duration: 'game' },
            { seq: 'R1.A.1b', t: 'EFFECT_END', id: 'fx@1', reason: 'expired' },
            { seq: 'R1.A.1c', t: 'EFFECT_START', id: 'fx@2', src: `SOR#108:${'2'.repeat(200)}`, p: 1, seat: 1, duration: 'game' },
            { seq: 'R1.A.1d', t: 'EFFECT_END', id: 'fx@2', reason: 'expired' },
        ]), nm);
        const cut = `X#${'9'.repeat(117)}…`;
        const copy = `Wampa #${'2'.repeat(117)}…`;
        expect(out.split('\n')).toEqual([
            `       ↳ Player 1: ${cut} for Player 1 (for the rest of the game)`,
            `       ↳ Effect from ${cut} ends (expired)`,
            `       ↳ Player 1: ${copy} for Player 1 (for the rest of the game)`,
            `       ↳ Effect from ${copy} ends (expired)`,
        ]);
    });
});

describe('render looks, names, used-by and simultaneous groups', function () {
    const nm = { nameOf: (id: string) => ({ 'SOR#142': 'Bold Resistance', 'SOR#108': 'Wampa', 'SOR#095': 'Battlefield Marine', 'SOR#200': 'Chimaera' }[id] ?? id) };
    const doc = (events: any[]) => ({ header: {} as any, decks: [], setup: [], events, annotations: [], cards: [] });

    // Value: protects=the §16 wording of LOOK; fails_when=the line drifts from the spec table, or the cards are not listed; why_new=LOOK is new; seam=none; no_claim=perspective redaction
    it('renders a look', function () {
        const out = render(doc([
            { seq: 'R1.A.1a', t: 'LOOK', p: 1, owner: 2, zone: 'deck', cards: ['SOR#108', 'SOR#095', 'SOR#142'], count: 3 },
            { seq: 'R1.A.1b', t: 'LOOK', p: 2, owner: 2, zone: 'hand', cards: ['SOR#108'], count: 1 },
            { seq: 'R1.A.1c', t: 'LOOK', p: 1, owner: 1, zone: 'deck', cards: [], count: 0 },
        ]), nm).split('\n');
        expect(out).toEqual([
            '       ↳ Player 1 looks at 3 cards of Player 2\'s deck: Wampa · Battlefield Marine · Bold Resistance',
            '       ↳ Player 2 looks at 1 card of Player 2\'s hand: Wampa',
            '       ↳ Player 1 looks at 0 cards of Player 1\'s deck',
        ]);
    });

    // Value: protects=the §16 wording of NAME, and that a hostile name is cut like a card name; fails_when=the line drifts, or an unbounded name reaches the story; why_new=NAME is new; seam=none; no_claim=escaping for a medium (§23)
    it('renders a named card', function () {
        const out = render(doc([
            { seq: 'R1.A.1a', t: 'NAME', p: 1, name: 'Wampa, Hungry Beast' },
            { seq: 'R1.A.1b', t: 'NAME', p: 2, name: 'x'.repeat(200) },
        ]), nm).split('\n');
        expect(out).toEqual([
            '       ↳ Player 1 names Wampa, Hungry Beast',
            `       ↳ Player 2 names ${'x'.repeat(119)}…`,
        ]);
    });

    // Value: protects=an ability used by another card's ability names that card (CR 7.6.13d, 7.6.14d); fails_when=usedBy is dropped from the line; why_new=usedBy is new; seam=none; no_claim=none
    it('names the card that used an ability', function () {
        const out = render(doc([
            { seq: 'R1.A.1a', t: 'ABILITY_ACTIVATE', p: 1, card: 'SOR#108', kind: 'triggered', usedBy: 'SOR#200' },
        ]), nm);
        expect(out).toBe('       ↳ Wampa uses an ability (used by Chimaera)');
    });

    // Value: protects=ABILITY_RESET is mechanism and prints nothing (§16); fails_when=it renders a line; why_new=fix round 1; seam=none; no_claim=none
    it('prints nothing for an ability reset', function () {
        expect(render(doc([{ seq: 'R1.A.1a', t: 'ABILITY_RESET', card: 'SOR#108', ability: 'a1' }]), nm)).toBe('');
    });

    // Value: protects=a simul group renders exactly as the same records without it, in file order (§16); fails_when=simul reorders, merges or changes a line; why_new=simul is new; seam=none; no_claim=a scrubber's stopping points
    it('keeps a simultaneous group on consecutive lines in file order', function () {
        const records = [
            { seq: 'R1.A.1', t: 'ATTACK', p: 1, atk: 'SOR#108', def: 'SOR#095', defenderType: 'unit' },
            { seq: 'R1.A.1a', t: 'DAMAGE', src: 'SOR#108', tgt: 'SOR#095', amt: 4, damageType: 'combat', hp: -1 },
            { seq: 'R1.A.1b', t: 'DAMAGE', src: 'SOR#095', tgt: 'SOR#108', amt: 3, damageType: 'combat', hp: 2 },
            { seq: 'R1.A.1c', t: 'DEFEAT', card: 'SOR#095', reason: 'attack', defeatedBy: 'SOR#108' },
        ];
        const grouped = records.map((r, i) => (i === 1 || i === 2 ? { ...r, simul: 'R1.A.1a' } : r));
        const plain = render(doc(records), nm);
        expect(render(doc(grouped), nm)).toBe(plain);
        expect(plain.split('\n')).toEqual([
            '  1. Player 1 attacks Battlefield Marine with Wampa',
            '       ↳ 4 damage to Battlefield Marine — -1 HP left',
            '       ↳ 3 damage to Wampa — 2 HP left',
            '       ↳ Battlefield Marine is defeated by Wampa',
        ]);
    });
});

describe('render copies', function () {
    const nm = { nameOf: (id: string) => ({ 'SOR#108': 'Wampa', 'SOR#095': 'Battlefield Marine', 'SOR#200': 'Clone' }[id] ?? id) };
    const doc = (events: any[]) => ({ header: {} as any, decks: [], setup: [], events, annotations: [], cards: [] });
    const seat = (s: 1 | 2, cards: any[] = []) => ({ seat: s, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0,
        resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards });

    // Value: protects=a unit that is a copy of another (CR 8.5) is named by the copied name, on the board and in the story, until a STATS ends the copy; fails_when=a copy is named by its printed card, or keeps the copied name after it ends; why_new=copyOf and name are new; seam=none; no_claim=escaping for a medium (§23)
    it('a copied unit is named by its copy name', function () {
        const clone = { id: 'SOR#200', zone: 'ground', damage: 0, exhausted: false, upgrades: [], shields: 0, experience: 0, statusTokens: {}, captured: [],
            power: 4, hp: 5, traits: [], copyOf: 'SOR#108', name: 'Wampa, Hungry Beast', cost: 4, aspects: [] };
        const out = render(doc([
            { seq: 'R2.start', t: 'ROUND_START', round: 2, active: 1, keyframe: { round: 2, phase: 'action', initiative: 1, players: { 1: seat(1, [clone]), 2: seat(2) } } },
            { seq: 'R2.A.1', t: 'ATTACK', p: 1, atk: 'SOR#200', def: 'SOR#095', defenderType: 'unit' },
            { seq: 'R2.A.1a', t: 'STATS', card: 'SOR#200', power: 0, hp: 0, traits: [] },
            { seq: 'R2.A.2', t: 'ATTACK', p: 1, atk: 'SOR#200', def: 'SOR#095', defenderType: 'unit' },
            { seq: 'R2.A.2a', t: 'STATS', card: 'SOR#200:2', power: 1, hp: 1, copyOf: 'SOR#095', name: 'x'.repeat(200) },
            { seq: 'R2.A.3', t: 'ATTACK', p: 1, atk: 'SOR#200:2', def: 'SOR#095', defenderType: 'unit' },
        ]), nm).split('\n');
        expect(out).toContain('      ground: Wampa, Hungry Beast 4/5');
        expect(out).toContain('  1. Player 1 attacks Battlefield Marine with Wampa, Hungry Beast');
        expect(out).toContain('  2. Player 1 attacks Battlefield Marine with Clone');
        expect(out).toContain(`  3. Player 1 attacks Battlefield Marine with ${'x'.repeat(119)}… #2`);
    });

    // Value: protects=a copy's #N on the board is cut like a card name (§16 nm); fails_when=the board appends the raw suffix; why_new=ship review pass 2; seam=none; no_claim=none
    it('cuts a copied unit\'s #N on the board', function () {
        const clone = { id: `SOR#200:${'2'.repeat(200)}`, zone: 'ground', damage: 0, exhausted: false, upgrades: [], shields: 0, experience: 0, statusTokens: {}, captured: [],
            power: 4, hp: 5, traits: [], copyOf: 'SOR#108', name: 'Wampa', cost: 4, aspects: [] };
        const out = render(doc([
            { seq: 'R2.start', t: 'ROUND_START', round: 2, active: 1, keyframe: { round: 2, phase: 'action', initiative: 1, players: { 1: seat(1, [clone]), 2: seat(2) } } },
        ]), nm).split('\n');
        expect(out).toContain(`      ground: Wampa #${'2'.repeat(117)}… 4/5`);
    });
});

describe('render keeps every record on one line', function () {
    const doc = (events: any[]) => ({ header: {} as any, decks: [], setup: [], events, annotations: [], cards: [] });

    // Value: protects=a line break in any field the story prints never starts a new story line (§16 strict layout, R-04); fails_when=a field other than names and effect text is printed raw; why_new=ship review pass 2; seam=none; no_claim=length cuts beyond names and effect text
    it('turns line breaks in any printed field into spaces', function () {
        const out = render(doc([
            { seq: 'R1.A.1', t: 'PASS', p: 1 },
            { seq: 'R1.A.1a', t: 'EFFECT_END', id: 'fx@9\nFAKE', reason: 'gone\nFAKE' },
            { seq: 'R1.A.1b', t: 'EFFECT_START', id: 'fx@1', src: 'SOR#108', p: 1, seat: 1, duration: 'later\nFAKE' },
            { seq: 'R1.A.2', t: 'GAME_END', winner: 1, reason: 'basesDestroyed\r\nFAKE' },
        ]));
        expect(out.split('\n').filter((l) => l.trimStart().startsWith('FAKE'))).toEqual([]);
        expect(out).toContain('Effect fx@9 FAKE ends (gone FAKE)');
        expect(out).toContain('(later FAKE)');
    });

    // Value: protects=control and bidirectional characters never reach a story line (§16, R-04); fails_when=flatten's class is narrowed to line breaks; why_new=the tests above use only CR, LF and U+2028; seam=none; no_claim=characters outside the listed set
    it('turns control and bidirectional characters into spaces', function () {
        const between = [0x0000, 0x0085, 0x202e, 0x2066, 0x200f, 0x061c, 0x2029, 0x007f];
        const out = render(doc([
            { seq: 'R1.A.1', t: 'GAME_END', winner: 1, reason: 'abcdefghi'.split('').map((c, k) => (k > 0 ? String.fromCharCode(between[k - 1]) : '') + c)
                .join('') },
        ]));
        expect(out).toContain('a b c d e f g h i');
    });

    // Value: protects=a resolver's long leader names are cut on deploy and flip lines (§16 nm); fails_when=DEPLOY_LEADER or LEADER_FLIP prints frontNameOf/backNameOf raw; why_new=side tests use the index, which cuts names itself; seam=none; no_claim=none
    it('cuts a resolver\'s long leader side names on deploy and flip lines', function () {
        const front = 'f'.repeat(200);
        const back = 'b'.repeat(200);
        const names = { nameOf: () => front, backNameOf: () => back };
        const out = render(doc([
            { seq: 'R1.A.1', t: 'DEPLOY_LEADER', p: 1, card: 'SOR#010' },
            { seq: 'R1.A.1a', t: 'LEADER_FLIP', p: 2, card: 'TWI#017', onStartingSide: false },
        ]), names).split('\n');
        const cut = (c: string) => `${c.repeat(119)}…`;
        expect(out[0]).toBe(`  1. Player 1 deploys ${cut('f')} as ${cut('b')}`);
        expect(out[1].length).toBeLessThan(300);
        expect(out[1]).toContain(` to ${cut('b')}`);
    });
});

describe('render size', function () {
    // Value: protects=the story stops at 16 MiB however a file's names expand its ids (spec §16); fails_when=render writes every record whatever its total size; why_new=ship review (adversarial): a few-byte id names a card in up to 120 characters; seam=none; no_claim=the 16 MiB file cap, which parse enforces
    it('stops the story at 16 MiB with a closing line', function () {
        const ids = Array.from({ length: 1000 }, (_, i) => `A#${i}`);
        const cards = ids.map((id) => ({ id, name: 'n'.repeat(120) }));
        const events = Array.from({ length: 150 }, (_, i) => ({ seq: `R1.A.${i + 1}`, t: 'DISCARD', p: 1, cards: ids }));
        const out = render({ header: {} as any, decks: [], setup: [], events, annotations: [], cards } as any);
        const lines = out.split('\n');
        expect(out.length).toBeLessThan(16 * 1024 * 1024 + 200000);
        expect(lines[lines.length - 1]).toBe('… the story stops here: it is longer than 16777216 characters');
        expect(lines.length).toBeLessThan(150);
    });
});
