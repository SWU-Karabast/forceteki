import { parse, validate } from '../../../swupgn/src/index';
import { checkKeyframes } from '../../../swupgn/src/integrity';
import { fold } from '../../../swupgn/src/fold';
import type { SwuPgnDocument } from '../../../swupgn/src/types';
import { isHarnessCountArtifact } from './swuPgnVectorGate';

/**
 * Limited abilities written by the reference writer (spec §10.1 `#limited-abilities`, `[W-49]`):
 * `limit` on every use of an ability that may be used only so many times each phase, round or
 * game; `ABILITY_RESET` when a card's uses reset because it changed zone; and each seat's
 * `abilityUses` in every keyframe, agreeing with the fold.
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

function expectCleanFile(text: string, doc: SwuPgnDocument): void {
    expect(validate(text).issues.filter((i) => i.code !== 'keyframe-mismatch')).withContext('validate()')
        .toEqual([]);
    expect(checkKeyframes(doc.events).mismatches.filter((m) => !isHarnessCountArtifact(m)))
        .withContext('fold reproduces every keyframe')
        .toEqual([]);
    expect(doc.header.recorderErrors).withContext('RecorderErrors')
        .toBeUndefined();
}

describe('SWU-PGN/1.0 limited abilities (writer)', function () {
    integration(function (contextRef) {
        const setupKallus = () => contextRef.setupTestAsync({
            phase: 'action',
            player1: {
                groundArena: ['agent-kallus#seeking-the-rebels', 'wampa'],
            },
            player2: {
                hand: ['waylay'],
                groundArena: ['general-veers#blizzard-force-commander'],
            },
        });

        /** Wampa defeats Veers (unique), and Kallus's once-per-round draw is used. */
        const useKallus = (context: any) => {
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.generalVeers);
            expect(context.player1).toHavePassAbilityPrompt('Draw a card');
            context.player1.clickPrompt('Trigger');
        };

        it('a once-per-round ability carries its limit and the keyframe counts it', async function () {
            await setupKallus();
            const { context } = contextRef;

            useKallus(context);

            const during = writerOutput(context.game).doc;
            const kallus = idOf(during, 'Agent Kallus');
            const uses = during.events.filter((e: any) => e.t === 'ABILITY_ACTIVATE' && e.card === kallus);
            expect(uses.length).withContext('one use of the draw')
                .toBe(1);
            expect((uses[0] as any).limit).toEqual({ max: 1, per: 'round' });
            expect(typeof (uses[0] as any).ability).toBe('string');
            const entry = { card: kallus, ability: (uses[0] as any).ability, count: 1, max: 1, per: 'round' as const };
            expect(fold(during.events).players[1].abilityUses).toEqual([entry]);

            context.player2.passAction();
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            // The round's end still holds the use: the fold clears it at the next ROUND_START.
            expect(keyframeAt(doc, 'R1.end').players[1].abilityUses).toEqual([entry]);
            expect(keyframeAt(doc, 'R1.end').players[2].abilityUses).toEqual([]);
            expectCleanFile(text, doc);
        });

        it('the use count clears at the next round', async function () {
            await setupKallus();
            const { context } = contextRef;

            useKallus(context);
            context.player2.passAction();
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            expect(keyframeAt(doc, 'R2.start').players[1].abilityUses).toEqual([]);
            expect(fold(doc.events).players[1].abilityUses).toEqual([]);
            expectCleanFile(text, doc);
        });

        it('a per-game ability stays used', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { base: 'mystic-monastery' },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.mysticMonastery);
            context.player2.passAction();
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            const use = doc.events.find((e: any) => e.t === 'ABILITY_ACTIVATE' && e.card === 'base@1') as any;
            expect(use?.limit).toEqual({ max: 3, per: 'game' });
            const entry = { card: 'base@1', ability: use.ability, count: 1, max: 3, per: 'game' as const };
            expect(keyframeAt(doc, 'R2.start').players[1].abilityUses).toEqual([entry]);
            expect(fold(doc.events).players[1].abilityUses).toEqual([entry]);
            expectCleanFile(text, doc);
        });

        it('a card that changes zone resets its uses', async function () {
            await setupKallus();
            const { context } = contextRef;

            useKallus(context);
            // Waylay returns Kallus to his owner's hand: a new object, whose uses start over.
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.agentKallus);

            const { text, doc } = writerOutput(context.game);
            const kallus = idOf(doc, 'Agent Kallus');
            const resets = doc.events.filter((e: any) => e.t === 'ABILITY_RESET');
            expect(resets).toEqual([jasmine.objectContaining({ card: kallus })]);
            const moveAt = doc.events.findIndex((e: any) => e.t === 'MOVE' && e.card === kallus && e.to === 'hand');
            expect(moveAt).toBeGreaterThan(-1);
            expect(doc.events.indexOf(resets[0])).toBeGreaterThan(moveAt);
            expect(fold(doc.events).players[1].abilityUses).toEqual([]);

            expectCleanFile(text, doc);
            context.player1.passAction();
            context.moveToNextActionPhase();
            const after = writerOutput(context.game);
            expectCleanFile(after.text, after.doc);
        });

        it('a blanked card keeps its uses for the round', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['agent-kallus#seeking-the-rebels', 'wampa'],
                },
                player2: {
                    hand: ['imprisoned'],
                    groundArena: ['general-veers#blizzard-force-commander'],
                },
            });
            const { context } = contextRef;

            useKallus(context);
            // Imprisoned blanks Kallus: his ability is hidden, its use is not undone.
            context.player2.clickCard(context.imprisoned);
            context.player2.clickCard(context.agentKallus);
            context.player1.passAction();
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            const kallus = idOf(doc, 'Agent Kallus');
            expect(keyframeAt(doc, 'R1.end').players[1].abilityUses)
                .toEqual([jasmine.objectContaining({ card: kallus, count: 1, max: 1, per: 'round' })]);
            expectCleanFile(text, doc);
        });

        it('a gained ability keeps its uses when its grant ends', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['improvised-identity'] }],
                    deck: ['battlefield-marine', 'cartel-spacer', 'takedown'],
                },
                player2: {
                    hand: ['confiscate'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickPrompt('Search the top 3 cards of your deck for a ground unit and discard it. Then, you may attack with this unit. For this attack, this unit gains the discarded unit\'s abilities.');
            context.player1.clickPrompt('Take nothing');
            context.player1.clickPrompt('Pass attack');
            // Confiscate defeats the upgrade: Wampa loses the ability, the engine keeps its use.
            context.player2.clickCard(context.confiscate);
            context.player2.clickCard(context.improvisedIdentity);
            context.player1.passAction();
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            const wampa = idOf(doc, 'Wampa');
            const use = doc.events.find((e: any) => e.t === 'ABILITY_ACTIVATE' && e.card === wampa && e.limit != null) as any;
            expect(use?.limit).toEqual({ max: 1, per: 'round' });
            expect(use?.grantedBy).toBe(idOf(doc, 'Improvised Identity'));
            expect(keyframeAt(doc, 'R1.end').players[1].abilityUses)
                .toEqual([{ card: wampa, ability: use.ability, count: 1, max: 1, per: 'round' }]);
            expect(keyframeAt(doc, 'R2.start').players[1].abilityUses).toEqual([]);
            expectCleanFile(text, doc);
        });

        it('a trigger that resolves after its card left play is counted, then reset', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'agent-kallus#seeking-the-rebels', damage: 2 }],
                },
                player2: {
                    groundArena: ['general-veers#blizzard-force-commander'],
                },
            });
            const { context } = contextRef;

            // Kallus and Veers defeat each other; Kallus's draw resolves after his move to discard.
            context.player1.clickCard(context.agentKallus);
            context.player1.clickCard(context.generalVeers);
            expect(context.agentKallus).toBeInZone('discard');
            expect(context.player1).toHavePassAbilityPrompt('Draw a card');
            context.player1.clickPrompt('Trigger');
            context.player2.passAction();
            context.moveToNextActionPhase();

            const { text, doc } = writerOutput(context.game);
            const kallus = idOf(doc, 'Agent Kallus');
            const useAt = doc.events.findIndex((e: any) => e.t === 'ABILITY_ACTIVATE' && e.card === kallus);
            expect((doc.events[useAt] as any).limit).toEqual({ max: 1, per: 'round' });
            const reset = doc.events.findIndex((e: any) => e.t === 'ABILITY_RESET' && e.card === kallus);
            expect(reset).toBeGreaterThan(useAt);
            expect((doc.events[reset] as any).ability).toBe((doc.events[useAt] as any).ability);
            expect(keyframeAt(doc, 'R1.end').players[1].abilityUses).toEqual([]);
            expectCleanFile(text, doc);
        });
    });
});

describe('SWU-PGN/1.0 limited abilities across undo (writer)', function () {
    undoIntegration(function (contextRef) {
        // Value: protects=the recorder's limited-use state follows undo both ways (a use undone is forgotten, a reset undone restores the use); fails_when=limitedUses is left out of the checkpoint or not restored; why_new=ship review state matrix; seam=none; no_claim=gained abilities (same map pair, covered by the undo lane)
        it('undoing past a use forgets it, and undoing past its reset restores it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['agent-kallus#seeking-the-rebels', 'wampa'],
                },
                player2: {
                    hand: ['waylay'],
                    groundArena: ['general-veers#blizzard-force-commander'],
                },
            });
            const { context } = contextRef;
            const useKallus = () => {
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.generalVeers);
                context.player1.clickPrompt('Trigger');
            };
            const uses = () => fold(writerOutput(context.game).doc.events).players[1].abilityUses ?? [];

            useKallus();
            expect(uses().length).withContext('the use is counted')
                .toBe(1);
            contextRef.snapshot.quickRollback(context.player1.id);
            expect(uses()).withContext('the undone use is forgotten')
                .toEqual([]);

            useKallus();
            const counted = uses();
            expect(counted.length).toBe(1);

            // Waylay returns Kallus to hand: his uses reset. Undo it, and the use is back.
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.agentKallus);
            expect(uses()).withContext('reset by the zone change')
                .toEqual([]);
            contextRef.snapshot.quickRollback(context.player2.id);
            expect(uses()).withContext('the undone reset restores the use')
                .toEqual(counted);

            const { text, doc } = writerOutput(context.game);
            expect(doc.events.filter((e: any) => e.t === 'ABILITY_RESET')).toEqual([]);
            expectCleanFile(text, doc);
        });
    });
});
