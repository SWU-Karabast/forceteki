describe('Action Phase', function() {
    integration(function(contextRef) {
        describe('Action Phase', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        resources: ['armed-to-the-teeth',
                            'collections-starhopper',
                            'covert-strength',
                            'chewbacca#pykesbane',
                            'battlefield-marine',
                            'moment-of-peace',
                            'moment-of-peace',
                            'moment-of-peace',
                            'moment-of-peace',
                            'moment-of-peace',
                            'moment-of-peace',
                            'moment-of-peace',
                        ],
                        hand: ['vanguard-infantry'],
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['death-trooper'],
                        spaceArena: ['mercenary-gunship']
                    }
                });
            });

            it('the prompt before an action and after should be different.', function () {
                const { context } = contextRef;

                // attack action
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.deathTrooper);
                context.player2.claimInitiative();
                expect(context.player1.currentActionTargets).not.toContain(context.wampa);

                // smuggle action
                context.player1.clickCard(context.collectionsStarhopper);
                expect(context.player1.currentActionTargets).not.toContain(context.collectionsStarhopper);

                // play from hand action
                context.player1.clickCard(context.vanguardInfantry);
                expect(context.player1.currentActionTargets).not.toContain(context.vanguardInfantry);

                // steal mercenary gunship
                expect(context.player1.readyResourceCount).toBe(4);
                expect(context.player1.currentActionTargets).toContain(context.mercenaryGunship);
                context.player1.clickCard(context.mercenaryGunship);
                expect(context.mercenaryGunship).toBeInZone('spaceArena', context.player1);
                expect(context.player1.readyResourceCount).toBe(0);

                // the stolen gunship is still ready, but its only remaining action is now an attack
                expect(context.player1.currentActionTargets).toContain(context.mercenaryGunship);
                context.player1.clickCard(context.mercenaryGunship);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4); // 1 from Wampa's Overwhelm + 3 from the gunship
                expect(context.player1.currentActionTargets).not.toContain(context.mercenaryGunship);
            });
        });

        describe('Action Phase, playing from the discard pile', function() {
            it('the prompt before playing a card from the discard pile and after should be different.', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['kylos-tie-silencer#ruthlessly-efficient'],
                    },
                    player2: {
                        hand: ['spark-of-rebellion'],
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                // discard Kylo's TIE Silencer from hand
                context.player2.clickCard(context.sparkOfRebellion);
                context.player2.clickCardInDisplayCardPrompt(context.kylosTieSilencer);
                expect(context.kylosTieSilencer).toBeInZone('discard', context.player1);

                // play from discard pile action
                expect(context.player1.currentActionTargets).toContain(context.kylosTieSilencer);
                context.player1.clickCard(context.kylosTieSilencer);
                expect(context.kylosTieSilencer).toBeInZone('spaceArena', context.player1);

                context.player2.passAction();
                expect(context.player1.currentActionTargets).not.toContain(context.kylosTieSilencer);
            });

            it('the prompt before playing an opponent\'s card from their discard pile and after should be different.', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['takedown'],
                    },
                    player2: {
                        spaceArena: ['stolen-athauler'],
                    }
                });

                const { context } = contextRef;

                // defeat player2's Stolen AT-Hauler, its When Defeated lets player1 play it this phase
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.stolenAthauler);
                expect(context.stolenAthauler).toBeInZone('discard', context.player2);

                context.player2.passAction();

                // play from the opponent's discard pile action, for free
                const readyResources = context.player1.readyResourceCount;
                expect(context.player1.currentActionTargets).toContain(context.stolenAthauler);
                context.player1.clickCard(context.stolenAthauler);
                expect(context.stolenAthauler).toBeInZone('spaceArena', context.player1);
                expect(context.player1.readyResourceCount).toBe(readyResources);

                context.player2.passAction();
                expect(context.player1.currentActionTargets).not.toContain(context.stolenAthauler);
            });
        });
    });
});
