describe('Supreme Leader Snoke, In The Seat Of Power', function() {
    integration(function(contextRef) {
        describe('Supreme Leader Snoke\'s Leader side ability', function() {
            it('should make the player choose between Villainy cards with most power', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'supreme-leader-snoke#in-the-seat-of-power',
                        groundArena: ['admiral-motti#brazen-and-scornful', 'kylo-ren#i-know-your-story', 'wampa', { card: 'hylobon-enforcer', damage: 1 }],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });
                const { context } = contextRef;

                // Use Supreme Leader Snoke's ability
                context.player1.clickCard(context.supremeLeaderSnoke);
                context.player1.clickPrompt('Give an Experience token to the unit with the most power among Villainy units');

                // should be able to select between units with most power (in case of equality)
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.kyloRen, context.hylobonEnforcer]);
                context.player1.clickCard(context.kyloRen);

                // Check that the costs were paid
                expect(context.supremeLeaderSnoke.exhausted).toBe(true);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                // Kylo Ren should have an Experience token
                expect(context.kyloRen).toHaveExactUpgradeNames(['experience']);
                expect(context.cartelSpacer.isUpgraded()).toBeFalse();
                expect(context.admiralMotti.isUpgraded()).toBeFalse();
                expect(context.hylobonEnforcer.isUpgraded()).toBeFalse();
                expect(context.pykeSentinel.isUpgraded()).toBeFalse();
                expect(context.wampa.isUpgraded()).toBeFalse();
            });

            it('should give an Experience token to the Villainy unit with the most power', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'supreme-leader-snoke#in-the-seat-of-power',
                        groundArena: ['admiral-motti#brazen-and-scornful', 'atst']
                    }
                });
                const { context } = contextRef;

                // Use Supreme Leader Snoke's ability
                context.player1.clickCard(context.supremeLeaderSnoke);
                context.player1.clickPrompt('Give an Experience token to the unit with the most power among Villainy units');

                // Check that the costs were paid
                expect(context.supremeLeaderSnoke.exhausted).toBe(true);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                // AT-ST should have the most power and receive an Experience token
                expect(context.atst).toHaveExactUpgradeNames(['experience']);
                expect(context.admiralMotti.isUpgraded()).toBeFalse();
            });

            it('should not give any experience if there isn\'t any Villainy unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'supreme-leader-snoke#in-the-seat-of-power',
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                // Use Supreme Leader Snoke's ability
                context.player1.clickCard(context.supremeLeaderSnoke);
                context.player1.clickPrompt('Give an Experience token to the unit with the most power among Villainy units');
                context.player1.clickPrompt('Use it anyway');

                // Check that the costs were paid
                expect(context.supremeLeaderSnoke.exhausted).toBe(true);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                // wampa should not be upgraded because it's not a Villainy unit
                expect(context.wampa.isUpgraded()).toBeFalse();
            });
        });

        describe('Supreme Leader Snoke\'s Unit side ability', function() {
            it('should make the player choose between Villainy units with most power', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'supreme-leader-snoke#in-the-seat-of-power', deployed: true },
                        groundArena: ['pirate-battle-tank', 'wampa'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['first-order-stormtrooper']
                    }
                });
                const { context } = contextRef;

                // Use Supreme Leader Snoke's ability
                context.player1.clickCard(context.supremeLeaderSnoke);
                context.player1.clickCard(context.p2Base);

                // should be able to select between units with most power (in case of equality)
                expect(context.player1).toBeAbleToSelectExactly([context.supremeLeaderSnoke, context.pirateBattleTank]);
                context.player1.clickCard(context.pirateBattleTank);

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.pirateBattleTank).toHaveExactUpgradeNames(['experience']);
                expect(context.supremeLeaderSnoke.isUpgraded()).toBeFalse();
                expect(context.cartelSpacer.isUpgraded()).toBeFalse();
                expect(context.firstOrderStormtrooper.isUpgraded()).toBeFalse();
                expect(context.wampa.isUpgraded()).toBeFalse();
            });

            it('gives an Experience token to the Villainy unit with the most power', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'supreme-leader-snoke#in-the-seat-of-power', deployed: true },
                        groundArena: ['atst']
                    }
                });
                const { context } = contextRef;

                // Use Supreme Leader Snoke's ability
                context.player1.clickCard(context.supremeLeaderSnoke);
                context.player1.clickCard(context.p2Base);

                // AT-ST should have the most power and receive an Experience token
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.atst).toHaveExactUpgradeNames(['experience']);
                expect(context.supremeLeaderSnoke.isUpgraded()).toBeFalse();
            });
        });
    });
});