describe('Mastery', function() {
    integration(function(contextRef) {
        describe('Mastery\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mastery', 'fenn-rau#protector-of-concord-dawn'],
                        groundArena: ['rebel-pathfinder', 'yoda#old-master'],
                        spaceArena: ['cartel-spacer'],
                        leader: 'chewbacca#walking-carpet'
                    },
                    player2: {
                        groundArena: ['wampa', 'gungi#finding-himself'],
                    }
                });
            });

            it('should cost 1 resource less when played on a unique unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mastery);

                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.yoda, context.gungi, context.cartelSpacer, context.wampa]);

                context.player1.clickCard(context.yoda);

                expect(context.yoda).toHaveExactUpgradeNames(['mastery']);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not cost 1 resource less when played on a non-unique unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mastery);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer).toHaveExactUpgradeNames(['mastery']);
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not allow targeting a non-unique unit when only enough resources for the discounted cost', function () {
                const { context } = contextRef;

                // With 3 resources, the player can only afford Mastery on unique units (cost 3),
                // not on non-unique units (cost 4). The lookahead cost check (seeing Yoda in play)
                // should not make non-unique units selectable targets.
                context.player1.setResourceCount(3);

                context.player1.clickCard(context.mastery);

                // Only unique units should be selectable — non-unique units (rebel-pathfinder, cartel-spacer, wampa)
                // should NOT appear as valid targets when the player can't afford full cost
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.gungi]);
                context.player1.clickCard(context.yoda);

                expect(context.yoda).toHaveExactUpgradeNames(['mastery']);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should work on enemy unique units as well', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mastery);
                context.player1.clickCard(context.gungi);

                expect(context.gungi).toHaveExactUpgradeNames(['mastery']);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should work with other cost adjustment', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fennRau);
                context.player1.clickCard(context.mastery);
                context.player1.clickCard(context.gungi);

                expect(context.gungi).toHaveExactUpgradeNames(['mastery']);
                expect(context.player1.exhaustedResourceCount).toBe(7); // 6+1
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Mastery\'s unique discount when played via Reforge with opponent cost increase', function() {
            it('should correctly stack cost adjustments: Reforge -4, Qira +3, unique discount -1', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bokatan-kryze#princess-in-exile',
                        base: 'capital-city',
                        resources: 4,
                        hand: ['reforge'],
                        groundArena: [{ card: 'yoda#old-master', upgrades: ['shield'] }, 'rebel-pathfinder'],
                        deck: ['mastery']
                    },
                    player2: {
                        resources: 6,
                        hand: ['qira#playing-her-part']
                    }
                });

                const { context } = contextRef;

                // Player 1 passes so player 2 can play Qira and name Mastery
                context.player1.passAction();

                // Player 2 plays Qira, looks at player 1's hand (sees Reforge), names Mastery
                context.player2.clickCard(context.qira);
                context.player2.clickDone();
                context.player2.chooseListOption('Mastery');

                // Mastery now costs 3 more for player 1 while Qira is in play

                // Player 1 plays Reforge (cost 2, no aspect penalty — Capital City provides Vigilance)
                context.player1.clickCard(context.reforge);

                // Defeat the Shield upgrade on Yoda
                context.player1.clickCard(context.shield);
                expect(context.shield).toBeInZone('outsideTheGame');

                // Deck search: find Mastery from the top 8 cards
                expect(context.player1).toHavePrompt('Search the top 8 cards of your deck for an upgrade that can attach to Yoda');
                context.player1.clickCardInDisplayCardPrompt(context.mastery);

                // Only Yoda is a valid target (Reforge constrains to the unit that lost the upgrade)
                expect(context.player1).toBeAbleToSelectExactly([context.yoda]);
                context.player1.clickCard(context.yoda);

                // Cost breakdown:
                //   Mastery base cost:        4
                //   Qira cost increase:       +3  → 7
                //   Reforge discount:         -4  → 3
                //   Mastery unique discount:  -1  → 2
                // Reforge cost: 2. Total resources exhausted: 2 + 2 = 4.
                expect(context.yoda).toHaveExactUpgradeNames(['mastery']);
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
