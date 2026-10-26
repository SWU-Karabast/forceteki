import { parse, render, validate } from '../../../swupgn/src/index';
import { checkKeyframes } from '../../../swupgn/src/integrity';
import { isHarnessCountArtifact } from './swuPgnVectorGate';
import { fold, stateAt } from '../../../swupgn/src/fold';
import type { GameEvent, SwuPgnDocument } from '../../../swupgn/src/types';

/**
 * The writer contract for the three mechanics Homeworlds (HMW) brings to the board, played
 * through the real engine. Each test pins what a reader can rely on (spec §10.1, §11, §12):
 *
 *   Fortify   an upgrade attached to a BASE. It is in play but in no arena, so it lives in the
 *             seat's `baseUpgrades`, never in `cards`; the base is `base@N` on every record that
 *             points at it; and an ability the upgrade grants the base names it in `grantedBy`.
 *   Beast     a token UNIT (3/3 Creature). It may be created for the opponent of the player whose
 *             ability made it, so `CREATE_TOKEN.p` is the seat that gets it.
 *   Weakness  a token UPGRADE (-1/-1), counted under `statusTokens.weakness`, that can take a
 *             unit's remaining HP to zero on its own.
 */


function writerOutput(game: any): { text: string; doc: SwuPgnDocument } {
    const text = game.getCachedSwuPgn() as string;
    return { text, doc: parse(text) };
}

/** Fold-vs-keyframe mismatches a production game could have (see SwuPgnKeyframeCompleteness). */
function realMismatches(doc: SwuPgnDocument) {
    return checkKeyframes(doc.events).mismatches
        .filter((m) => !isHarnessCountArtifact(m));
}

function expectClean(text: string, doc: SwuPgnDocument): void {
    expect(validate(text).issues).withContext('validate()')
        .toEqual([]);
    expect(realMismatches(doc)).withContext('fold reproduces every keyframe')
        .toEqual([]);
}

/** The `%%% CARDS` id of the card with this display name. */
function idNamed(doc: SwuPgnDocument, name: string): string {
    const entry = (doc.cards ?? []).find((c) => c.name === name);
    expect(entry).withContext(`%%% CARDS names ${name}`)
        .toBeDefined();
    return entry?.id ?? '';
}

// Loosely typed: `Extract` cannot narrow the PLAY-family member, whose `t` is itself a union.
const ofType = (doc: SwuPgnDocument, t: GameEvent['t']): any[] => doc.events.filter((e) => e.t === t);

/** True when `seq` is `action` itself or one of its lettered sub-steps. */
const under = (seq: string, action: string) => seq === action || (seq.startsWith(action) && (/^[a-z]+$/).test(seq.slice(action.length)));

const keyframes = (doc: SwuPgnDocument) =>
    doc.events.filter((e: any) => (e.t === 'ROUND_START' || e.t === 'ROUND_END') && e.keyframe) as any[];

describe('SWU-PGN/1.0 Homeworlds: Fortify', function () {
    integration(function (contextRef) {
        it('attaches to a base: base@N is the host, baseUpgrades holds it, and defeating it takes it off', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['landing-pad', 'carbonite-chamber'],
                    spaceArena: ['cartel-spacer'],
                    resources: 10,
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg'],
                },
                player2: {
                    groundArena: ['wampa'],
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.landingPad);
            context.player1.clickCard(context.p1Base);
            context.player2.passAction();
            context.player1.clickCard(context.carboniteChamber);
            context.player1.clickCard(context.p1Base);
            context.moveToNextActionPhase();
            // Carbonite Chamber's own Action: [defeat this upgrade] -- an upgrade leaving a base.
            context.player1.clickCard(context.carboniteChamber);
            context.player1.clickCard(context.wampa);
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const landingPad = idNamed(doc, 'Landing Pad');
            const chamber = idNamed(doc, 'Carbonite Chamber');
            const spacer = idNamed(doc, 'Cartel Spacer');

            // The attaching MOVE names the base as its host, like a unit host (§10.1).
            const entry = ofType(doc, 'MOVE').find((e) => e.card === landingPad && e.to === 'base');
            expect(entry).toEqual(jasmine.objectContaining({ from: 'hand', to: 'base', p: 1, kind: 'upgrade', attachedTo: 'base@1' }));

            // PLAY_UPGRADE points at the base as base@N -- never the base card's SET#NUM (§6.3).
            const play = ofType(doc, 'PLAY_UPGRADE').find((e) => e.card === landingPad);
            expect(play).toEqual(jasmine.objectContaining({ p: 1, zone: 'base', target: 'base@1' }));

            // Between keyframes the fold already has it on the base, and nowhere in an arena.
            const afterPlay = stateAt(doc.events, play.seq);
            expect(afterPlay.players[1]?.baseUpgrades).toEqual([landingPad]);
            expect(afterPlay.players[1]?.cards.map((c) => c.id)).not.toContain(landingPad);

            // "Friendly space units get +1/+0" is stated by a STATS filed under the play that
            // caused it, not under the PASS that follows.
            const buff = ofType(doc, 'STATS').find((e) => e.card === spacer && e.power === 3);
            expect(buff).withContext('Landing Pad\'s +1/+0 is recorded')
                .toBeDefined();
            expect(under(buff.seq, play.seq)).withContext(`${buff.seq} is a sub-step of ${play.seq}`)
                .toBeTrue();

            // The engine's keyframe carries both base upgrades once both are attached.
            const r2 = keyframes(doc).find((e) => e.seq === 'R2.start');
            expect([...r2.keyframe.players[1].baseUpgrades].sort()).toEqual([chamber, landingPad].sort());

            // Its own action, so not granted; the upgrade leaves `base` for the discard pile.
            const activate = ofType(doc, 'ABILITY_ACTIVATE').find((e) => e.card === chamber);
            expect(activate.kind).toBe('action');
            expect(activate.grantedBy).toBeUndefined();
            const exit = ofType(doc, 'MOVE').find((e) => e.card === chamber && e.from === 'base');
            expect(exit).toEqual(jasmine.objectContaining({ to: 'discard', p: 1 }));
            expect(exit.attachedTo).withContext('exits are host-less')
                .toBeUndefined();
            expect(ofType(doc, 'DEFEAT').find((e) => e.card === chamber)).toBeDefined();

            const end = fold(doc.events);
            expect(end.players[1]?.baseUpgrades).toEqual([landingPad]);
            expect(end.players[1]?.discard).toContain(chamber);

            const story = render(doc);
            expect(story).toContain('Player 1 plays Landing Pad on Player 1\'s base');
            expect(story).toContain('      base: Landing Pad');
        });

        it('names the upgrade that granted the base an ability, and points at the base as base@N', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['heavy-ion-cannon', 'beast-lair', 'battlefield-marine', 'daring-raid', 'military-academy'],
                    resources: 12,
                    groundArena: ['rebel-pathfinder'],
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg', 'porg'],
                },
                player2: {
                    spaceArena: ['green-squadron-awing'],
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg', 'porg'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.heavyIonCannon);
            context.player1.clickCard(context.p1Base);
            context.player2.passAction();
            context.player1.clickCard(context.beastLair);
            context.player1.clickCard(context.p1Base);
            context.player2.passAction();
            context.player1.clickCard(context.militaryAcademy);
            context.player1.clickCard(context.p1Base);
            context.player2.passAction();
            // The base's gained Action: [discard a card from your hand]: Deal 2 damage to a unit.
            context.player1.clickCard(context.p1Base);
            context.player1.clickCard(context.greenSquadronAwing);
            context.player1.clickCard(context.battlefieldMarine);
            context.player2.passAction();
            context.player1.claimInitiative();
            context.player1.clickPrompt('Skip Resourcing');
            context.player2.clickPrompt('Skip Resourcing');
            // The base's gained trigger: "When the action phase starts: ... create a Beast token."
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.daringRaid);

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const cannon = idNamed(doc, 'Heavy Ion Cannon');
            const lair = idNamed(doc, 'Beast Lair');
            const academy = idNamed(doc, 'Military Academy');
            const awing = idNamed(doc, 'Green Squadron A-Wing');
            const pathfinder = idNamed(doc, 'Rebel Pathfinder');

            // A gained Action is the player's action, used BY the base, granted by the upgrade.
            const action = ofType(doc, 'ABILITY_ACTIVATE').find((e) => e.grantedBy === cannon);
            expect(action).toEqual(jasmine.objectContaining({ p: 1, card: 'base@1', kind: 'action' }));
            expect(action.seq).withContext('an action ability is a numbered action (§9)')
                .toMatch(/^R1\.A\.\d+$/);

            // The base is the damage source, so it is written base@N there too (§6.3).
            const damage = ofType(doc, 'DAMAGE').find((e) => e.tgt === awing);
            expect(damage).toEqual(jasmine.objectContaining({ src: 'base@1', amt: 2 }));

            // A gained trigger: same card and grantor shape, and the Beast it creates.
            const trigger = ofType(doc, 'ABILITY_ACTIVATE').find((e) => e.grantedBy === lair);
            expect(trigger).toEqual(jasmine.objectContaining({ p: 1, card: 'base@1', kind: 'triggered' }));
            expect(ofType(doc, 'CREATE_TOKEN').some((e) => e.p === 1 && e.token.startsWith('TOKEN:beast#') && under(e.seq, trigger.seq.replace(/[a-z]+$/, ''))))
                .withContext('Beast Lair\'s Beast is created by its trigger')
                .toBeTrue();

            // "Friendly units gain Overwhelm" arrives as a keyword, under the play that caused it.
            const academyPlay = ofType(doc, 'PLAY_UPGRADE').find((e) => e.card === academy);
            const overwhelm = ofType(doc, 'STATS').find((e) => e.card === pathfinder && (e.keywords ?? []).includes('overwhelm'));
            expect(overwhelm).toBeDefined();
            expect(under(overwhelm.seq, academyPlay.seq)).withContext(`${overwhelm.seq} is a sub-step of ${academyPlay.seq}`)
                .toBeTrue();

            expect([...(fold(doc.events).players[1]?.baseUpgrades ?? [])].sort()).toEqual([academy, cannon, lair].sort());
            expect(render(doc)).toContain('Player 1 uses Player 1\'s base (granted by Heavy Ion Cannon)');
        });

        it('records a replacement on a base upgrade: the damage never happens and the upgrade leaves', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'kestro-city', upgrades: ['alliance-shield-generator'] },
                    deck: ['wampa', 'wampa', 'wampa'],
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['strike-team-vanguard'],
                }
            });
            const { context } = contextRef;

            // A single 5-damage instance: prevented, then the upgrade defeats itself and draws.
            context.player2.clickCard(context.strikeTeamVanguard);
            context.player2.clickCard(context.p1Base);
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const generator = idNamed(doc, 'Alliance Shield Generator');
            const attack = ofType(doc, 'ATTACK').find((e) => e.def === 'base@1');

            const replacement = ofType(doc, 'ABILITY_ACTIVATE').find((e) => e.card === generator);
            expect(replacement).toEqual(jasmine.objectContaining({ p: 1, kind: 'replacement' }));
            expect(ofType(doc, 'DAMAGE').some((e) => e.tgt === 'base@1' && under(e.seq, attack.seq)))
                .withContext('a prevented hit writes no DAMAGE')
                .toBeFalse();
            const exit = ofType(doc, 'MOVE').find((e) => e.card === generator && e.from === 'base' && e.to === 'discard');
            expect(under(exit.seq, attack.seq)).withContext('the replacement resolved inside the attack')
                .toBeTrue();
            expect(stateAt(doc.events, exit.seq).players[1]?.baseUpgrades).toEqual([]);
            expect(keyframes(doc).find((e) => e.seq === 'R2.start').keyframe.players[1].baseUpgrades).toEqual([]);
        });
    });
});

describe('SWU-PGN/1.0 Homeworlds: Beast tokens', function () {
    integration(function (contextRef) {
        it('a Beast is a token unit created for the seat CREATE_TOKEN.p names, even the opponent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['easy-prey'],
                    resources: 10,
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg'],
                },
                player2: {
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg'],
                },
            });
            const { context } = contextRef;

            // "Create a Beast token. An opponent creates a Beast token. Give a Weakness token to it."
            context.player1.clickCard(context.easyPrey);
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const index = doc.cards ?? [];
            expect(index.find((c) => c.name === 'Beast')).toEqual(jasmine.objectContaining({ kind: 'unit' }));
            expect(index.find((c) => c.name === 'Weakness')).toEqual(jasmine.objectContaining({ kind: 'upgrade' }));

            const created = ofType(doc, 'CREATE_TOKEN').filter((e) => e.token.startsWith('TOKEN:beast#'));
            expect(created.map((e) => e.p)).toEqual([1, 2]);
            for (const beast of created) {
                expect(beast).toEqual(jasmine.objectContaining({ zone: 'ground', kind: 'unit' }));
                // Its MOVE into the arena places it, under the same seat; it enters exhausted.
                expect(ofType(doc, 'MOVE').find((e) => e.card === beast.token && e.to === 'ground'))
                    .toEqual(jasmine.objectContaining({ from: 'outsideTheGame', p: beast.p, kind: 'unit' }));
                expect(ofType(doc, 'EXHAUST').some((e) => e.card === beast.token)).toBeTrue();
                expect(ofType(doc, 'STATS').find((e) => e.card === beast.token)).toEqual(jasmine.objectContaining({ power: 3, hp: 3 }));
            }

            // The opponent's Beast carries the Weakness: bound by attachedTo, counted, and -1/-1.
            const theirs = created[1].token;
            expect(ofType(doc, 'MOVE').find((e) => e.card.startsWith('TOKEN:weakness#')))
                .toEqual(jasmine.objectContaining({ from: 'outsideTheGame', to: 'ground', p: 2, kind: 'upgrade', attachedTo: theirs }));

            // At the next keyframe each seat holds one Beast, and P2's is a weakened 2/2.
            const r2 = keyframes(doc).find((e) => e.seq === 'R2.start').keyframe;
            const beastOf = (seat: 1 | 2) => r2.players[seat].cards.find((c: any) => c.id.startsWith('TOKEN:beast#'));
            expect(beastOf(1)).toEqual(jasmine.objectContaining({ power: 3, hp: 3, statusTokens: {} }));
            expect(beastOf(2)).toEqual(jasmine.objectContaining({ id: theirs, power: 2, hp: 2, statusTokens: { weakness: 1 } }));
            // Named by its own copy number, whatever it is: an undo re-creates tokens with fresh ids.
            const copy = (/:(\d+)$/).exec(theirs)?.[1];
            expect(render(doc)).toContain(`Player 2 creates Beast${copy ? ` #${copy}` : ''} in ground`);
        });

        it('a Beast readied on creation gets a READY, the other stays exhausted', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['catch-the-scent'],
                    resources: 10,
                },
            });
            const { context } = contextRef;

            // "Create 2 Beast tokens and ready 1 of them."
            context.player1.clickCard(context.catchTheScent);

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const beasts = ofType(doc, 'CREATE_TOKEN').filter((e) => e.token.startsWith('TOKEN:beast#'))
                .map((e) => e.token);
            expect(beasts.length).toBe(2);
            const flags = fold(doc.events).players[1]?.cards.filter((c) => beasts.includes(c.id)).map((c) => c.exhausted);
            expect(flags.sort()).toEqual([false, true]);
            expect(ofType(doc, 'READY').filter((e) => beasts.includes(e.card)).length).toBe(1);
        });
    });
});

describe('SWU-PGN/1.0 Homeworlds: Weakness tokens', function () {
    integration(function (contextRef) {
        it('a Weakness that takes a unit to 0 HP: STATS hp 0, then the defeat, with the token balanced', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['torrent'],
                    resources: 10,
                },
                player2: {
                    spaceArena: ['tieln-fighter'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.torrent);
            context.player1.clickCard(context.tielnFighter);

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const tie = idNamed(doc, 'TIE/ln Fighter');
            const play = ofType(doc, 'PLAY_EVENT').find((e) => e.card === idNamed(doc, 'Torrent'));
            const steps = doc.events.filter((e) => under(e.seq, play.seq)).map((e: any) => ({ t: e.t, card: e.card, hp: e.hp, count: e.count, token: e.token }));

            // The token lands and is counted; the engine then states the unit at 0 HP. That
            // STATS is the reason for the defeat: nothing dealt damage.
            const at = (t: string, pred: (s: any) => boolean = () => true) => steps.findIndex((s) => s.t === t && pred(s));
            const gained = at('STATUS_TOKEN', (s) => s.card === tie && s.token === 'weakness' && s.count === 1);
            const zero = at('STATS', (s) => s.card === tie && s.hp === 0);
            const lost = at('STATUS_TOKEN', (s) => s.card === tie && s.count === -1);
            const defeat = at('DEFEAT', (s) => s.card === tie);
            expect([gained, zero, lost, defeat].every((i) => i >= 0)).withContext(JSON.stringify(steps))
                .toBeTrue();
            expect(gained < zero && zero < defeat && lost < defeat).withContext(JSON.stringify(steps))
                .toBeTrue();
            expect(ofType(doc, 'DAMAGE').some((e) => e.tgt === tie)).toBeFalse();
            expect(ofType(doc, 'DEFEAT').find((e) => e.card === tie)).toEqual(jasmine.objectContaining({ reason: 'frameworkEffect' }));

            const end = fold(doc.events);
            expect(end.players[2]?.cards.map((c) => c.id)).not.toContain(tie);
            expect(end.players[2]?.discard).toContain(tie);
        });

        it('Weakness tokens stack under one counter, and STATS carries the summed -X/-X', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['torrent'],
                    // Torrent gives 2 Weakness tokens instead while you control a Naboo base.
                    base: 'great-grass-plains',
                    resources: 10,
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg'],
                },
                player2: {
                    groundArena: ['wampa'],
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.torrent);
            context.player1.clickCard(context.wampa);
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const wampa = idNamed(doc, 'Wampa');
            const gains = ofType(doc, 'STATUS_TOKEN').filter((e) => e.card === wampa && e.token === 'weakness');
            expect(gains.reduce((n, e) => n + e.count, 0)).toBe(2);
            // Each token is its own card id, so a reader can follow either one off the host.
            const tokens = ofType(doc, 'MOVE').filter((e) => e.card.startsWith('TOKEN:weakness#') && e.attachedTo === wampa)
                .map((e) => e.card);
            expect(new Set(tokens).size).toBe(2);

            const onBoard = keyframes(doc).find((e) => e.seq === 'R2.start').keyframe.players[2].cards.find((c: any) => c.id === wampa);
            expect(onBoard).toEqual(jasmine.objectContaining({ power: 2, hp: 3, statusTokens: { weakness: 2 } }));
            expect(render(doc)).toContain('[2 weakness]');
        });
    });
});

/**
 * Grand Moff Tarkin, Tyrant of the Outer Rim deploys as a DIFFERENT card -- The Death Star, Icon
 * of Tyranny, a space unit -- and his deployed side can defeat a base outright. Both are new to the
 * format: a leader with a second name, and a base that falls with HP left.
 */
describe('SWU-PGN/1.0 Homeworlds: Grand Moff Tarkin / The Death Star', function () {
    integration(function (contextRef) {
        it('deploys as one action, and is named The Death Star while deployed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'grand-moff-tarkin#tyrant-of-the-outer-rim',
                    resources: 9,
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg'],
                },
                player2: {
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.grandMoffTarkin);
            context.player1.clickPrompt('Deploy Grand Moff Tarkin');
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const tarkin = doc.header.p1Leader;

            // The index names the printed front, and the other side beside it -- never whichever
            // side happened to be up when the file was written.
            expect((doc.cards ?? []).find((c) => c.id === tarkin))
                .toEqual(jasmine.objectContaining({ name: 'Grand Moff Tarkin, Tyrant of the Outer Rim', backSideName: 'The Death Star, Icon of Tyranny' }));

            // One action: the Epic Action is numbered, and the deploy it performed is its sub-step.
            const epic = ofType(doc, 'ABILITY_ACTIVATE').find((e) => e.card === tarkin && e.kind === 'epic');
            const deploy = ofType(doc, 'DEPLOY_LEADER').find((e) => e.card === tarkin);
            expect(epic.seq).toMatch(/^R1\.A\.\d+$/);
            expect(under(deploy.seq, epic.seq)).withContext(`${deploy.seq} is a sub-step of ${epic.seq}`)
                .toBeTrue();
            expect(deploy).toEqual(jasmine.objectContaining({ zone: 'space', epic: true }));

            // Deployed, he is a space unit; the next keyframe agrees.
            const r2 = keyframes(doc).find((e) => e.seq === 'R2.start').keyframe.players[1];
            expect(r2.leader).toEqual(jasmine.objectContaining({ id: tarkin, deployed: true, epicActionUsed: true }));
            expect(r2.cards.find((c: any) => c.id === tarkin)).toEqual(jasmine.objectContaining({ zone: 'space', power: 2, hp: 12 }));

            const story = render(doc);
            expect(story).toContain('Player 1 deploys Grand Moff Tarkin, Tyrant of the Outer Rim as The Death Star, Icon of Tyranny');
            expect(story).toContain('space: The Death Star, Icon of Tyranny 2/12');
            expect(story.match(/^\s+\d+\. Player 1 (uses|deploys) Grand Moff Tarkin/gm)?.length).withContext('the deploy is not a second numbered action')
                .toBe(1);
        });

        it('defeats a base with HP left: a DEFEAT on base@N before GAME_END, and baseDefeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { leader: { card: 'grand-moff-tarkin#tyrant-of-the-outer-rim', deployed: true } },
                player2: { base: { card: 'administrators-tower', damage: 20 } },
            });
            const { context } = contextRef;

            // "When the regroup phase starts: You may defeat a base with 10 or less remaining HP."
            context.moveToRegroupPhase();
            context.player1.clickCard(context.p2Base);

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const tarkin = doc.header.p1Leader;
            const trigger = ofType(doc, 'ABILITY_ACTIVATE').find((e) => e.card === tarkin && e.kind === 'triggered');
            const defeat = ofType(doc, 'DEFEAT').find((e) => e.card === 'base@2');
            const end = ofType(doc, 'GAME_END')[0];
            expect(defeat).toEqual(jasmine.objectContaining({ reason: 'ability', defeatedBy: tarkin }));
            const order = [trigger, defeat, end].map((e) => doc.events.indexOf(e));
            expect(order).toEqual([...order].sort((a, b) => a - b));
            expect(end).toEqual(jasmine.objectContaining({ winner: 1 }));
            // Nothing dealt damage: the base fell with HP to spare, and only the DEFEAT says so.
            expect(ofType(doc, 'DAMAGE').some((e) => e.tgt === 'base@2')).toBeFalse();

            const folded = fold(doc.events);
            expect(folded.players[2]?.baseDefeated).toBeTrue();
            expect(folded.players[1]?.baseDefeated).toBeUndefined();
            expect(render(doc)).toContain('Player 2\'s base is defeated by The Death Star, Icon of Tyranny');
        });

        it('writes nothing when Tarkin declines, and the game goes on', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { leader: { card: 'grand-moff-tarkin#tyrant-of-the-outer-rim', deployed: true } },
                player2: { base: { card: 'administrators-tower', damage: 20 } },
            });
            const { context } = contextRef;

            context.moveToRegroupPhase();
            context.player1.clickPrompt('Pass');

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            expect(ofType(doc, 'DEFEAT').some((e) => e.card === 'base@2')).toBeFalse();
            expect(ofType(doc, 'GAME_END').length).toBe(0);
            expect(fold(doc.events).players[2]?.baseDefeated).toBeUndefined();
        });

        it('a base destroyed by damage gets the same DEFEAT, blaming the attacker', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { base: { card: 'administrators-tower', damage: 26 } },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            context.ignoreUnresolvedActionPhasePrompts = true;

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const wampa = idNamed(doc, 'Wampa');
            const hit = ofType(doc, 'DAMAGE').find((e) => e.tgt === 'base@2');
            const defeat = ofType(doc, 'DEFEAT').find((e) => e.card === 'base@2');
            expect(hit.hp).toBe(0);
            expect(defeat).toEqual(jasmine.objectContaining({ reason: 'attack', defeatedBy: wampa }));
            expect(doc.events.indexOf(defeat)).toBeLessThan(doc.events.indexOf(ofType(doc, 'GAME_END')[0]));
            expect(fold(doc.events).players[2]?.baseDefeated).toBeTrue();
        });
    });
});

/**
 * Homeworlds cards that care about ANOTHER card's type or trait -- "while you control a Naboo
 * base", "if an opponent controls an Endor base", "when you play a Fortification upgrade". A
 * reader never evaluates the condition: the engine did, and the file records the outcome. These
 * pin that the outcome is recorded where a reader looks for it.
 */
describe('SWU-PGN/1.0 Homeworlds: abilities conditioned on a base or a trait', function () {
    integration(function (contextRef) {
        it('a keyword granted by a base trait arrives in STATS, under the play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { base: 'kachirho', hand: ['origin-tree-shyyyo', 'wookiee-rangers', 'soaring-cancell'], resources: 20 },
            });
            const { context } = contextRef;

            // Kachirho is a Kashyyyk base: Wookiee Rangers gains Sentinel, Soaring Can-Cell gains
            // Ambush, and Origin Tree Shyyyo discounts the 2nd and 3rd units played this round.
            context.player1.clickCard(context.originTreeShyyyo);
            context.player2.passAction();
            context.player1.clickCard(context.wookieeRangers);
            context.player2.passAction();
            context.player1.clickCard(context.soaringCancell);

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const keywordsAfterPlay = (name: string) => {
                const play = ofType(doc, 'PLAY').find((e) => e.card === idNamed(doc, name));
                const stats = ofType(doc, 'STATS').filter((e) => e.card === play.card && under(e.seq, play.seq));
                return stats[stats.length - 1]?.keywords;
            };
            expect(keywordsAfterPlay('Wookiee Rangers')).toContain('sentinel');
            expect(keywordsAfterPlay('Soaring Can-Cell')).toContain('ambush');

            // What was PAID is the EXHAUST_RESOURCES before each play; `cost` stays printed. Each
            // is printed cost + this harness's 2-resource aspect penalty, less Shyyyo's discount
            // (none for itself, then 2, then 3).
            const plays = ofType(doc, 'PLAY');
            const paid = plays.map((play) => ofType(doc, 'EXHAUST_RESOURCES').find((e) => e.for === play.seq)?.amount);
            expect(plays.map((e) => e.cost)).toEqual([6, 5, 2]);
            expect(paid).toEqual([8, 5, 1]);
        });

        it('a keyword granted while another card is in play leaves STATS when that card does', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['gunga-city-guard', 'captain-tarpals#grand-army-captain'] },
                player2: { hand: ['open-fire'], hasInitiative: true },
            });
            const { context } = contextRef;

            // Gunga City Guard: "While you control another Gungan unit or a Naboo base, this unit
            // gains Shielded." Captain Tarpals is the other Gungan; kill him.
            context.player2.clickCard(context.openFire);
            context.player2.clickCard(context.captainTarpals);

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const guard = idNamed(doc, 'Gunga City Guard');
            const tarpalsDefeat = ofType(doc, 'DEFEAT').find((e) => e.card === idNamed(doc, 'Captain Tarpals, Grand Army Captain'));
            const guardStats = ofType(doc, 'STATS').filter((e) => e.card === guard);
            const defeatAt = doc.events.indexOf(tarpalsDefeat);
            expect(guardStats.some((e) => doc.events.indexOf(e) < defeatAt && e.keywords.includes('shielded')))
                .withContext('Shielded while Tarpals is in play')
                .toBeTrue();
            const after = guardStats[guardStats.length - 1];
            expect(doc.events.indexOf(after)).toBeGreaterThan(defeatAt);
            expect(after.keywords).not.toContain('shielded');
        });

        it('an effect that changes entering play is recorded by what is NOT written: no EXHAUST', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { base: 'dune-sea', hand: ['ritual-dragon', 'battlefield-marine'], resources: 20 },
            });
            const { context } = contextRef;

            // Ritual Dragon: "While you control a Tatooine base, friendly units enter play ready."
            context.player1.clickCard(context.ritualDragon);
            context.player2.passAction();
            context.player1.clickCard(context.battlefieldMarine);

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const entered = [idNamed(doc, 'Ritual Dragon'), idNamed(doc, 'Battlefield Marine')];
            expect(ofType(doc, 'EXHAUST').filter((e) => entered.includes(e.card))).toEqual([]);
            expect(fold(doc.events).players[1]?.cards.filter((c) => entered.includes(c.id)).map((c) => c.exhausted))
                .toEqual([false, false]);
        });

        it('a condition on the OPPONENT\'s base fires its record under the play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['surveillance-cruiser'], resources: 20, deck: ['porg', 'porg', 'porg'] },
                player2: { base: 'great-grass-plains' },
            });
            const { context } = contextRef;

            // "When Played: If an opponent controls an Endor, Kashyyyk, Naboo, or Tatooine base,
            // draw a card." Great Grass Plains is a Naboo base.
            context.player1.clickCard(context.surveillanceCruiser);

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const play = ofType(doc, 'PLAY').find((e) => e.card === idNamed(doc, 'Surveillance Cruiser'));
            expect(ofType(doc, 'DRAW').some((e) => e.p === 1 && e.count === 1 && under(e.seq, play.seq))).toBeTrue();
        });

        it('a trigger on a card TRAIT (Fortification), granted to a base, fires under the play that met it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'kestro-city', upgrades: ['the-tarkin-doctrine#protect-and-punish'] },
                    hand: ['landing-pad'],
                    resources: 20,
                },
                player2: { groundArena: ['wampa'] },
            });
            const { context } = contextRef;

            // The Tarkin Doctrine: Attached base gains "When you play a Fortification upgrade:
            // Exhaust an enemy unit." Landing Pad has the Fortification trait.
            context.player1.clickCard(context.landingPad);
            context.player1.clickCard(context.p1Base);
            context.player1.clickCard(context.wampa);

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const play = ofType(doc, 'PLAY_UPGRADE').find((e) => e.card === idNamed(doc, 'Landing Pad'));
            const trigger = ofType(doc, 'ABILITY_ACTIVATE').find((e) => e.grantedBy === idNamed(doc, 'The Tarkin Doctrine, Protect and Punish'));
            expect(trigger).toEqual(jasmine.objectContaining({ card: 'base@1', kind: 'triggered' }));
            expect(under(trigger.seq, play.seq)).toBeTrue();
            expect(ofType(doc, 'EXHAUST').some((e) => e.card === idNamed(doc, 'Wampa') && under(e.seq, play.seq))).toBeTrue();
        });

        it('a discount for an upgraded base is the EXHAUST_RESOURCES amount', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { base: { card: 'kestro-city', upgrades: ['landing-pad'] }, hand: ['queen-amidala#retaking-theed'], resources: 20 },
            });
            const { context } = contextRef;

            // Queen Amidala: "If you control an upgraded base, this unit costs 2 resources less."
            context.player1.clickCard(context.queenAmidala);

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const play = ofType(doc, 'PLAY').find((e) => e.card === idNamed(doc, 'Queen Amidala, Retaking Theed'));
            // Printed 4, + the harness's 2-resource aspect penalty, - 2 for the upgraded base.
            expect(play.cost).toBe(4);
            expect(ofType(doc, 'EXHAUST_RESOURCES').find((e) => e.for === play.seq)?.amount).toBe(4);
        });
    });
});

describe('SWU-PGN/1.0 Homeworlds: a base falling after the game is over', function () {
    integration(function (contextRef) {
        // Value: protects=a base killed during "Continue Playing" still gets its DEFEAT, and the keyframe's baseDefeated stays true after a heal, agreeing with the fold; fails_when=base DEFEATs come only from the game-end path, or the keyframe recomputes baseDefeated from live damage; why_new=every other base-defeat test ends the game on the spot; seam=none; no_claim=a third "game end"
        it('writes the second base\'s DEFEAT in continued play, and keeps both defeated through a heal', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    hand: ['repair'],
                    base: { card: 'kestro-city', damage: 25 },
                    resources: 5,
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg'],
                },
                player2: {
                    groundArena: ['atst'],
                    base: { card: 'administrators-tower', damage: 26 },
                    deck: ['porg', 'porg', 'porg', 'porg', 'porg'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Continue Playing');
            context.player2.clickPrompt('Continue Playing');

            // The engine does not end the game a second time; the file must still say it fell.
            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.p1Base);
            // Healed back under its HP: still a base that fell.
            context.player1.clickCard(context.repair);
            context.player1.clickCard(context.p1Base);
            context.moveToNextActionPhase();

            // The file served to players is frozen at game end (Game.getCachedSwuPgn), so continued
            // play never reaches it today. Generate one from the recorder as it now stands: the
            // writer must stay consistent should that cache ever be refreshed.
            const text = (context.game as any)._swuPgnAdapter.generateFile() as string;
            const doc = parse(text);
            expectClean(text, doc);
            const defeats = ofType(doc, 'DEFEAT').filter((e) => (/^base@/).test(e.card));
            expect(defeats.map((e) => e.card)).toEqual(['base@2', 'base@1']);
            expect(ofType(doc, 'GAME_END').length).withContext('the game ended once')
                .toBe(1);
            const r2 = keyframes(doc).find((e) => e.seq === 'R2.start').keyframe;
            expect([r2.players[1].baseDefeated, r2.players[2].baseDefeated]).toEqual([true, true]);
            const folded = fold(doc.events);
            expect([folded.players[1]?.baseDefeated, folded.players[2]?.baseDefeated]).toEqual([true, true]);
        });
    });
});

describe('SWU-PGN/1.0 writer: PASS is the Pass action', function () {
    integration(function (contextRef) {
        // Value: protects=PASS is written only for the Pass action, never after a play/attack or a claimed initiative; fails_when=PASS goes back to the turn-rotation event; why_new=no test asserted when PASS is absent; seam=none; no_claim=Twin Suns counters
        it('writes PASS for a pass, and nothing after a play, an attack or a claim', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    hand: ['battlefield-marine'],
                    resources: 10,
                },
                player2: {
                    groundArena: ['atst'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);      // a play
            context.player2.passAction();                              // a pass
            context.player1.clickCard(context.wampa);                  // an attack
            context.player1.clickCard(context.p2Base);
            context.player2.claimInitiative();                         // a claim
            context.player1.passAction();                              // a pass, ending the phase

            const { text, doc } = writerOutput(context.game);
            expectClean(text, doc);
            const r1 = doc.events.filter((e) => (/^R1\.A\.\d+$/).test(e.seq)).map((e: any) => `${e.t}:${e.p ?? ''}`);
            expect(r1).toEqual(['PLAY:1', 'PASS:2', 'ATTACK:1', 'CLAIM_INITIATIVE:2', 'PASS:1']);
            const story = render(doc);
            expect(story).toContain('1. Player 1 plays Battlefield Marine');
            expect(story).toContain('2. Player 2 passes');
            expect(story).toContain('3. Player 1 attacks Player 2\'s base with Wampa');
            expect(story).toContain('4. Player 2 claims initiative');
            expect(story).toContain('5. Player 1 passes');
        });
    });
});
