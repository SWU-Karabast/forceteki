import * as GameStateInjector from '../../../../server/game/core/stateSerialization/GameStateInjector';
import { liveStintKey, resolveStintId } from '../../../../server/game/core/stateSerialization/WatcherEntryEncoding';

/**
 * Establishes `P2-C1`'s acceptance criteria for the engine-side state-injection surface that the ported
 * test helpers (`PlayerInteractionWrapper`, `GameFlowWrapper`) now delegate to, and that `P2-C2`'s save
 * loader will call directly. The whole suite is the primary regression detector for the *port* itself
 * (every spec's board construction exercises it); these specs cover only the surface the old test-only
 * code path never had — see the plan's §7 proof table for the discrimination each row establishes.
 */
describe('GameStateInjector', function() {
    integration(function(contextRef) {
        it('setLeaderStatus performs no deploy-limit bookkeeping; markLeaderDeployUsed spends it explicitly (AC3)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {},
            });
            const { context } = contextRef;
            const player = context.player1Object;
            const leader = player.deckLeader as any;

            GameStateInjector.setLeaderStatus(player, { deployed: true });
            expect(leader.deployEpicActionLimit.isAtMax(player)).toBeFalse();

            GameStateInjector.markLeaderDeployUsed(player);
            expect(leader.deployEpicActionLimit.isAtMax(player)).toBeTrue();
        });

        it('setOutsideTheGame establishes the declared order, including re-ordering an already-staged card (AC5/B1)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    hand: ['battlefield-marine'],
                },
            });
            const { context } = contextRef;
            const player = context.player1Object;

            GameStateInjector.moveAllNonBaseZonesToStaging(player);

            const beforeNames = player.outsideTheGameZone.cards.map((card) => card.internalName);
            expect(beforeNames).toContain('wampa');
            expect(beforeNames).toContain('battlefield-marine');

            const wampa = player.outsideTheGameZone.cards.find((card) => card.internalName === 'wampa');
            const marine = player.outsideTheGameZone.cards.find((card) => card.internalName === 'battlefield-marine');

            // `wampa` is already staged: this establishes that setOutsideTheGame actually re-orders it
            // (a moveTo-only implementation would silently no-op on a card already in its target zone).
            GameStateInjector.setOutsideTheGame(player, [wampa, marine]);

            const expectedOrder = beforeNames
                .filter((name) => name !== 'wampa' && name !== 'battlefield-marine')
                .concat(['wampa', 'battlefield-marine']);

            expect(() => GameStateInjector.assertStagingZoneMatches(player, expectedOrder)).not.toThrow();
        });

        it('setOutsideTheGame moves a not-yet-staged card into the zone via moveTo, not just re-ordering (AC5/B1)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    hand: ['battlefield-marine'],
                },
            });
            const { context } = contextRef;
            const player = context.player1Object;
            const wampa = context.wampa;
            const marine = context.battlefieldMarine;

            // Neither card is in `outsideTheGame` yet (one is in an arena, the other in hand), so this call
            // must exercise the `moveTo` branch for both — unlike the sibling re-ordering spec above, whose
            // cards are staged first via `moveAllNonBaseZonesToStaging`, only ever exercising the
            // already-a-member remove+re-add branch.
            //
            // `outsideTheGame` is never actually empty at this point: `Player.initialiseAsync` generates
            // every player's Force token unconditionally at game start (`this.game.generateToken(this,
            // TokenCardName.Force)`), before any test-specific board setup runs, and nothing in this test's
            // config gives either player the Force, so the token sits there for the whole test. An earlier
            // version of this spec hardcoded the expected zone contents to exactly `['wampa',
            // 'battlefield-marine']` and failed for exactly this reason (`unexpected cards present:
            // [the-force]`) — not a race or a lazily-created token, just an expectation that forgot about a
            // fact true of every player from the moment the game starts. Sampling the zone's actual
            // contents immediately beforehand and folding them into the expectation avoids assuming
            // anything about what else might be sitting there.
            expect(player.outsideTheGameZone.cards.includes(wampa)).toBeFalse();
            expect(player.outsideTheGameZone.cards.includes(marine)).toBeFalse();
            const residueBefore = player.outsideTheGameZone.cards.map((card) => card.internalName);

            GameStateInjector.setOutsideTheGame(player, [wampa, marine]);

            const expectedOrder = [...residueBefore, 'wampa', 'battlefield-marine'];
            expect(() => GameStateInjector.assertStagingZoneMatches(player, expectedOrder)).not.toThrow();
        });

        it('assertStagingZoneMatches distinguishes residue, missing, and wrong-order failures (AC5/B8)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    discard: ['wampa', 'battlefield-marine'],
                },
            });
            const { context } = contextRef;
            const player = context.player1Object;

            GameStateInjector.moveAllNonBaseZonesToStaging(player);
            const names = player.outsideTheGameZone.cards.map((card) => card.internalName);
            expect(names.length).toBeGreaterThan(1);

            // Exact ordered match passes.
            expect(() => GameStateInjector.assertStagingZoneMatches(player, names)).not.toThrow();

            // Residue: the zone holds a card that isn't expected.
            expect(() => GameStateInjector.assertStagingZoneMatches(player, names.slice(1)))
                .toThrowError(GameStateInjector.StateInjectionError, /unexpected cards present/);

            // Missing: an expected card is absent from the zone.
            expect(() => GameStateInjector.assertStagingZoneMatches(player, [...names, 'never-there']))
                .toThrowError(GameStateInjector.StateInjectionError, /expected cards absent/);

            // Wrong order: same cards, same counts, different order.
            expect(() => GameStateInjector.assertStagingZoneMatches(player, [...names].reverse()))
                .toThrowError(GameStateInjector.StateInjectionError, /wrong order/);
        });

        it('setMostRecentInPlayId round-trips through liveStintKey and resolveStintId for a discarded card (AC4)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    discard: ['wampa'],
                },
            });
            const { context } = contextRef;
            const card = context.player1Object.discard[0] as any;

            GameStateInjector.setMostRecentInPlayId(card, 7);

            expect(liveStintKey(card)).toBe(7);
            expect(resolveStintId('live', liveStintKey(card))).toBe(7);
        });

        it('setMostRecentInPlayId refuses a card that is currently in play (AC4/B4)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                },
            });
            const { context } = contextRef;
            const card = context.wampa as any;

            expect(() => GameStateInjector.setMostRecentInPlayId(card, 3)).toThrowError(/mostRecentInPlayId/);
        });

        it('setMostRecentInPlayId refuses a card in a hidden zone (hand and deck) (AC4/B4)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    deck: ['battlefield-marine'],
                },
            });
            const { context } = contextRef;
            const handCard = context.player1Object.hand[0] as any;
            const deckCard = context.player1Object.deckZone.cards[0] as any;

            expect(() => GameStateInjector.setMostRecentInPlayId(handCard, 1)).toThrowError(/mostRecentInPlayId/);
            expect(() => GameStateInjector.setMostRecentInPlayId(deckCard, 1)).toThrowError(/mostRecentInPlayId/);
        });

        it('setCreditTokenCount reaches exactly the requested count from a nonzero start, both up and down (B5)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {},
            });
            const { context } = contextRef;
            const player = context.player1Object;

            GameStateInjector.setCreditTokenCount(player, 3);
            expect(player.creditTokenCount).toBe(3);

            GameStateInjector.setCreditTokenCount(player, 5);
            expect(player.creditTokenCount).toBe(5);

            GameStateInjector.setCreditTokenCount(player, 2);
            expect(player.creditTokenCount).toBe(2);
        });
    });
});
