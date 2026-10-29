import { parse, validate } from '../../../swupgn/src/index';
import { checkKeyframes } from '../../../swupgn/src/integrity';
import { fold } from '../../../swupgn/src/fold';
import type { SwuPgnDocument } from '../../../swupgn/src/types';
import { isHarnessCountArtifact } from './swuPgnVectorGate';

/**
 * A unit's other attributes, control and ownership written by the reference writer (spec §10.1
 * `STATS` and `TAKE_CONTROL`, §11, `[W-55]`–`[W-57]`): `traits` on every `STATS`, `blank`,
 * `leaderUnit` and a copy's `copyOf`/`name`/`cost`/`aspects`; an upgrade `TAKE_CONTROL` when an
 * attached upgrade changes controller; `owner` on a resource steal that changed zone; and, in
 * every keyframe, `traits` on each card, `foreignResources` on each seat, and `owner` /
 * `upgradeControllers` where they apply, agreeing with the fold.
 */

function writerOutput(game: any): { text: string; doc: SwuPgnDocument } {
    const text = game.getCachedSwuPgn() as string;
    return { text, doc: parse(text) };
}

const idOf = (doc: SwuPgnDocument, name: string): string => {
    const id = (doc.cards ?? []).find((c) => c.name.startsWith(name))?.id;
    expect(id).withContext(`card id for ${name}`)
        .toBeDefined();
    return id ?? '';
};

const keyframeAt = (doc: SwuPgnDocument, seq: string): any => (doc.events.find((e) => e.seq === seq) as any)?.keyframe;

const statsFor = (doc: SwuPgnDocument, card: string): any[] => doc.events.filter((e: any) => e.t === 'STATS' && e.card === card);

const last = <T>(list: T[]): T | undefined => list[list.length - 1];

const keyframeCard = (keyframe: any, card: string): any => {
    for (const seat of [1, 2]) {
        const found = (keyframe?.players?.[seat]?.cards ?? []).find((c: any) => c.id === card);
        if (found) {
            return { seat, card: found };
        }
    }
    return undefined;
};

function expectCleanFile(text: string, doc: SwuPgnDocument): void {
    expect(validate(text).issues.filter((i) => i.code !== 'keyframe-mismatch')).withContext('validate()')
        .toEqual([]);
    expect(checkKeyframes(doc.events).mismatches.filter((m) => !isHarnessCountArtifact(m)))
        .withContext('fold reproduces every keyframe')
        .toEqual([]);
    expect(doc.header.recorderErrors).withContext('RecorderErrors')
        .toBeUndefined();
}

/** Every keyframe carries `traits` on every card and `foreignResources` on every seat ([W-57]). */
function expectAttributeKeyframes(doc: SwuPgnDocument): void {
    const keyframes = doc.events.filter((e: any) => e.keyframe != null).map((e: any) => [e.seq, e.keyframe]);
    expect(keyframes.length).toBeGreaterThan(0);
    for (const [seq, keyframe] of keyframes) {
        for (const seat of [1, 2]) {
            const player = keyframe.players[seat];
            expect(Array.isArray(player.foreignResources)).withContext(`${seq} seat ${seat} foreignResources`)
                .toBeTrue();
            for (const card of player.cards) {
                expect(Array.isArray(card.traits)).withContext(`${seq} ${card.id} traits`)
                    .toBeTrue();
            }
        }
    }
}

describe('SWU-PGN/1.0 attributes, control and ownership (writer)', function () {
    integration(function (contextRef) {
        it('Force Lightning blanks a unit in STATS for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['force-lightning'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['atst'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.forceLightning);
            context.player1.clickCard(context.atst);
            expect(context.atst.isFullyBlanked()).toBeTrue();

            const during = writerOutput(context.game).doc;
            const atst = idOf(during, 'AT-ST');
            const blanked = last(statsFor(during, atst));
            expect(blanked?.blank).withContext('the STATS after the blank')
                .toBeTrue();
            expect(blanked?.traits).toEqual(['imperial', 'vehicle', 'walker']);
            expect(fold(during.events).players[2].cards.find((c) => c.id === atst)?.blank).toBeTrue();

            context.player2.passAction();
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            const restored = last(statsFor(doc, atst));
            expect(restored?.blank).withContext('the phase ended: a STATS without blank')
                .toBeUndefined();
            expect(restored?.traits).toEqual(['imperial', 'vehicle', 'walker']);
            expect(keyframeCard(keyframeAt(doc, 'R1.end'), atst)?.card.blank).toBeUndefined();
            expectAttributeKeyframes(doc);
            expectCleanFile(text, doc);
        });

        it('Foundling adds a trait', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['foundling'],
                    groundArena: ['battlefield-marine'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.foundling);
            context.player1.clickCard(context.battlefieldMarine);
            context.player2.passAction();
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            const marine = idOf(doc, 'Battlefield Marine');
            const traits = statsFor(doc, marine).map((s) => s.traits);
            expect(traits[0]).toEqual(['rebel', 'trooper']);
            expect(last(traits)).toEqual(['mandalorian', 'rebel', 'trooper']);
            expect(keyframeCard(keyframeAt(doc, 'R2.start'), marine)?.card.traits).toEqual(['mandalorian', 'rebel', 'trooper']);
            expectAttributeKeyframes(doc);
            expectCleanFile(text, doc);
        });

        it('Clone copies another unit and STATS carries copyOf, name, cost and aspects', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['clone'],
                    groundArena: ['wampa'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.clone);
            context.player1.clickCard(context.wampa);
            expect(context.clone).toBeCloneOf(context.wampa);
            context.player2.passAction();
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            const clone = idOf(doc, 'Clone');
            const wampa = idOf(doc, 'Wampa');
            const stats = last(statsFor(doc, clone));
            expect(stats?.copyOf).toBe(wampa);
            expect(stats?.name).toBe('Wampa');
            expect(stats?.cost).toBe(4);
            expect(stats?.aspects).toEqual([...context.wampa.aspects]);
            expect(stats?.traits).toEqual(['clone', 'creature']);
            // The copied unit itself is not a copy.
            expect(last(statsFor(doc, wampa))?.copyOf).toBeUndefined();
            const card = keyframeCard(keyframeAt(doc, 'R2.start'), clone)?.card;
            expect([card?.copyOf, card?.name, card?.cost]).toEqual([wampa, 'Wampa', 4]);
            expectAttributeKeyframes(doc);
            expectCleanFile(text, doc);
        });

        // Value: protects=a copy's PLAY carries the played card's own printed cost, and the copy effect lasts while the copy is in play (spec §10.1 PLAY.cost, EFFECT_START duration); fails_when=PLAY.cost reads the copied cost, or the copy effect is written as until "a card leaves play"; why_new=the control vector's Clone PLAY said cost 2 and its effect "until a card leaves play"; seam=none; no_claim=copies of copies
        it('Clone\'s PLAY carries Clone\'s own cost, and its copy effect lasts while it is in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['clone'],
                    groundArena: ['wampa'],
                    resources: 12,
                },
                player2: {
                    hand: ['vanquish'],
                    resources: 12,
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.clone);
            context.player1.clickCard(context.wampa);
            expect(context.clone).toBeCloneOf(context.wampa);
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.clone);
            expect(context.clone).toBeInZone('discard');

            const { text, doc } = writerOutput(context.game);
            const clone = idOf(doc, 'Clone');
            const play = doc.events.find((e: any) => e.t === 'PLAY' && e.card === clone) as any;
            expect(play.cost).toBe(7);
            const start = doc.events.find((e: any) => e.t === 'EFFECT_START' && e.src === clone) as any;
            expect([start.duration, start.untilText]).toEqual(['whileSourceInPlay', undefined]);
            const end = doc.events.find((e: any) => e.t === 'EFFECT_END' && e.id === start.id) as any;
            expect(end.reason).toBe('sourceLeft');
            expectCleanFile(text, doc);
        });

        it('a vehicle a leader pilots is a leader unit, and the leader card itself is not marked', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'asajj-ventress#i-work-alone',
                    spaceArena: ['cartel-spacer'],
                    resources: 6,
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.asajjVentress);
            context.player1.clickPrompt('Deploy Asajj Ventress as a Pilot');
            context.player1.clickCard(context.cartelSpacer);
            context.player2.passAction();
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            const spacer = idOf(doc, 'Cartel Spacer');
            expect(last(statsFor(doc, spacer))?.leaderUnit).toBeTrue();
            expect(keyframeCard(keyframeAt(doc, 'R2.start'), spacer)?.card.leaderUnit).toBeTrue();
            expectAttributeKeyframes(doc);
            expectCleanFile(text, doc);
        });

        it('a deployed leader is not written as made a leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'asajj-ventress#i-work-alone',
                    resources: 6,
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.asajjVentress);
            context.player1.clickPrompt('Deploy Asajj Ventress');
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            const asajj = idOf(doc, 'Asajj Ventress');
            expect(statsFor(doc, asajj).every((s) => s.leaderUnit === undefined)).toBeTrue();
            expect(keyframeCard(keyframeAt(doc, 'R2.start'), asajj)?.card.leaderUnit).toBeUndefined();
            expectCleanFile(text, doc);
        });

        it('Pre Vizsla takes an upgrade and writes an upgrade TAKE_CONTROL', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pre-vizsla#power-hungry'],
                    leader: 'darth-vader#dark-lord-of-the-sith',
                },
                player2: {
                    groundArena: [{ card: 'wampa', upgrades: ['academy-training'] }],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.preVizsla);
            context.player1.clickCard(context.academyTraining);
            expect(context.preVizsla).toHaveExactUpgradeNames(['academy-training']);
            expect(context.academyTraining.controller).toBe(context.player1Object);
            context.player2.passAction();
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            const training = idOf(doc, 'Academy Training');
            const preVizsla = idOf(doc, 'Pre Vizsla');
            const takes = doc.events.filter((e: any) => e.t === 'TAKE_CONTROL' && e.card === training);
            expect(takes).toEqual([jasmine.objectContaining({ p: 1, card: training, zone: 'ground', from: 2 })]);
            const host = fold(doc.events).players[1].cards.find((c) => c.id === preVizsla);
            expect(host?.upgrades).toEqual([training]);
            expect(host?.upgradeControllers).toBeUndefined();
            expectAttributeKeyframes(doc);
            expectCleanFile(text, doc);
        });

        it('an upgrade played on an enemy unit is listed in that unit\'s upgradeControllers', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ruthlessness'],
                },
                player2: {
                    groundArena: ['wampa'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.ruthlessness);
            context.player1.clickCard(context.wampa);
            context.player2.passAction();
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            const wampa = idOf(doc, 'Wampa');
            const ruthlessness = idOf(doc, 'Ruthlessness');
            expect(keyframeCard(keyframeAt(doc, 'R2.start'), wampa)?.card.upgradeControllers).toEqual({ [ruthlessness]: 1 });
            expectAttributeKeyframes(doc);
            expectCleanFile(text, doc);
        });

        it('a stolen unit is listed with its owner in the keyframe', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['traitorous'],
                },
                player2: {
                    hand: ['academy-training'],
                    groundArena: ['superlaser-technician'],
                },
            });
            const { context } = contextRef;

            // Played, not placed by the harness: the harness attaches setup upgrades with no
            // record naming their host, so a fold could not know whose unit holds one.
            context.player1.passAction();
            context.player2.clickCard(context.academyTraining);
            context.player2.clickCard(context.superlaserTechnician);
            context.player1.clickCard(context.traitorous);
            context.player1.clickCard(context.superlaserTechnician);
            expect(context.superlaserTechnician).toBeInZone('groundArena', context.player1);
            context.player2.passAction();
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            const technician = idOf(doc, 'Superlaser Technician');
            const training = idOf(doc, 'Academy Training');
            const found = keyframeCard(keyframeAt(doc, 'R2.start'), technician);
            expect(found?.seat).toBe(1);
            expect(found?.card.owner).toBe(2);
            // CR 8.27: the host changing hands does not change who controls its upgrades.
            expect(context.academyTraining.controller).toBe(context.player2Object);
            expect(found?.card.upgradeControllers).toEqual({ [training]: 2 });
            expectAttributeKeyframes(doc);
            expectCleanFile(text, doc);
        });

        it('a unit put into play as a resource under its defeater writes its owner', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arquitens-assault-cruiser'],
                },
                player2: {
                    spaceArena: ['tieln-fighter'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.arquitensAssaultCruiser);
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.tielnFighter);
            expect(context.tielnFighter).toBeInZone('resource', context.player1);
            context.player2.passAction();
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            const tie = idOf(doc, 'TIE/ln Fighter');
            const take = doc.events.find((e: any) => e.t === 'TAKE_CONTROL' && e.card === tie) as any;
            expect(take).toEqual(jasmine.objectContaining({ p: 1, zone: 'resource', owner: 2 }));
            expect(take?.from).toBeUndefined();
            expect(keyframeAt(doc, 'R2.start').players[1].foreignResources).toEqual([tie]);
            expect(keyframeAt(doc, 'R2.start').players[2].foreignResources).toEqual([]);
            expectAttributeKeyframes(doc);
            expectCleanFile(text, doc);
        });

        it('keyframes agree with the fold on every new field', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['traitorous', 'foundling', 'clone'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    hand: ['force-lightning', 'academy-training'],
                    groundArena: ['superlaser-technician', 'wampa'],
                },
            });
            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.academyTraining);
            context.player2.clickCard(context.superlaserTechnician);
            context.player1.clickCard(context.traitorous);
            context.player1.clickCard(context.superlaserTechnician);
            context.player2.clickCard(context.forceLightning);
            context.player2.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.foundling);
            context.player1.clickCard(context.superlaserTechnician);
            context.player2.passAction();
            context.player1.clickCard(context.clone);
            context.player1.clickCard(context.wampa);
            context.moveToNextActionPhase();
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            expect(checkKeyframes(doc.events).mismatches).toEqual(
                checkKeyframes(doc.events).mismatches.filter((m) => isHarnessCountArtifact(m))
            );
            expectAttributeKeyframes(doc);
            expectCleanFile(text, doc);
        });
    });
});
