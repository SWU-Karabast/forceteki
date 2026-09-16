import { save } from '../../../../server/game/core/stateSerialization/MatchSerializer';

/**
 * Regression coverage for the `assertCompleteness` refusals surfaced by `P2-E`'s degradation measurement
 * (finding `P2E-I1-01`): boards on which a card was genuinely on the board but appeared nowhere in the
 * saved document, so the writer refused the whole save.
 *
 * Two distinct causes, both reproduced here:
 *
 * 1. The arena walk skipped hosts on the strength of `card.isLeaderUnit()`, which is not a statement about
 *    a card's identity -- `UnitProperties.isLeaderUnit` returns `isLeaderAttachedToThis()`, true for any
 *    ordinary unit currently carrying the `IsLeader` ongoing effect. Both live sources of that effect get a
 *    test: an ordinary upgrade (The Darksaber) and a pilot-deployed leader that makes its host a leader
 *    (`LeaderUnitCard.addPilotDeploy`). These boards must now save with the host at a *real coordinate* --
 *    a manifest entry would not do, because the state is perfectly representable and was only ever lost to
 *    a filter bug.
 * 2. A captive stranded in a `CaptureZone` its captor has since replaced, which genuinely has no coordinate
 *    and so degrades with an `unrepresentedCard` entry rather than refusing.
 */
describe('MatchSerializer.save — completeness of the position walk', function() {
    integration(function(contextRef) {
        describe('a unit made a leader unit by an attached upgrade', function() {
            it('emits the host at its own arena coordinate, with the upgrade on it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'bokatan-kryze#for-all-of-mandalore', upgrades: ['the-darksaber#icon-of-leadership'] },
                            'battlefield-marine',
                        ],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    },
                });

                const { context } = contextRef;

                // The Darksaber applies ongoingEffects.isLeader() to its attached unit, so the host answers
                // isLeaderUnit() despite being an ordinary non-leader unit and not either player's deckLeader.
                expect(context.bokatanKryze.isLeaderUnit()).toBeTrue();

                const document = save(context.game);
                const hostEntry = document.players[0].groundArena.find((entry) => entry.card === 'bokatan-kryze#for-all-of-mandalore');

                expect(hostEntry).toBeDefined();
                expect(hostEntry.upgrades.map((upgrade) => upgrade.card)).toEqual(['the-darksaber#icon-of-leadership']);

                // The host is representable, so it must be saved rather than declared away.
                expect(document.engineOnlyFacts.filter((fact) => fact.category === 'unrepresentedCard')).toEqual([]);
            });
        });

        describe('a unit piloted by a deployed leader that makes it a leader unit', function() {
            it('emits the host at its own arena coordinate and degrades with a pilotLeader fact naming it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#any-methods-necessary',
                        spaceArena: ['cartel-spacer'],
                        resources: 8,
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                context.player1.clickPrompt('Deploy Boba Fett as a Pilot');
                context.player1.clickCard(context.cartelSpacer);

                // Boba Fett's piloting trigger distributes up to 4 damage; take none, to leave a quiescent board.
                context.player1.setDistributeDamagePromptState(new Map());

                expect(context.cartelSpacer.isLeaderUnit()).toBeTrue();

                const document = save(context.game);
                const hostEntry = document.players[0].spaceArena.find((entry) => entry.card === 'cartel-spacer');

                expect(hostEntry).toBeDefined();

                // The pilot leader itself stays at the leader singleton and is kept out of the host's
                // upgrades, so the manifest fact is still the only record of the attachment -- but its
                // target is now the host's real coordinate rather than a position-less ref.
                expect(hostEntry.upgrades).toEqual([]);
                expect(document.players[0].leader.deployed).toBeFalse();

                const pilotFact = document.engineOnlyFacts.find((fact) => fact.category === 'pilotLeader');
                expect(pilotFact).toBeDefined();
                expect(pilotFact.target).toEqual({
                    card: 'cartel-spacer',
                    controllerSeat: 'p1',
                    zone: 'spaceArena',
                    ordinal: document.players[0].spaceArena.indexOf(hostEntry),
                });

                expect(document.engineOnlyFacts.filter((fact) => fact.category === 'unrepresentedCard')).toEqual([]);
            });
        });

        describe('a captive stranded in a CaptureZone its captor has replaced', function() {
            it('degrades with an unrepresentedCard fact instead of refusing the save', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sanctioners-shuttle'],
                        // Sanctioner's Shuttle captures via a Coordinate ability, which needs three
                        // friendly units in play once the shuttle itself arrives.
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['padawan-starfighter'],
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sanctionersShuttle);
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.greenSquadronAwing).toBeCapturedBy(context.sanctionersShuttle);

                context.player2.passAction();

                // Bouncing the captor to hand and replaying it makes UnitProperties.setCaptureZoneEnabled
                // mint a *fresh* CaptureZone, leaving the captive pointing at the old one. The captor's live
                // capturedUnits no longer lists it, so no walk of the captor can reach it and v1 has no
                // coordinate to give it.
                context.player1.moveCard(context.sanctionersShuttle, 'hand');
                context.player1.clickCard(context.sanctionersShuttle);

                // Deliberately not `toBeCapturedBy`, which reads the captor's live capture zone: the point of
                // this board is that the captive is in a capture zone the captor no longer owns.
                expect(context.greenSquadronAwing.zoneName).toBe('capture');
                expect(context.sanctionersShuttle.capturedUnits).not.toContain(context.greenSquadronAwing);

                const document = save(context.game);
                const facts = document.engineOnlyFacts.filter((fact) => fact.category === 'unrepresentedCard');

                expect(facts.length).toBe(1);
                expect(facts[0].source).toEqual({
                    card: 'green-squadron-awing',
                    controllerSeat: 'p2',
                    zone: null,
                    ordinal: null,
                });
                expect((facts[0].target as { card: string }).card).toBe('sanctioners-shuttle');
                expect(facts[0].duration).toBeNull();
                expect(facts[0].description).toContain('captured by');
            });
        });
    });
});
