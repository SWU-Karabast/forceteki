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
    });
});
