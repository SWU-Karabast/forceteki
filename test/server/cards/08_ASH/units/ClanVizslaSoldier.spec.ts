describe('Clan Vizsla Soldier', function() {
    integration(function(contextRef) {
        describe('Clan Vizsla Soldier\'s when defeated ability', function() {
            it('should allow defeating an upgrade when defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['clan-vizsla-soldier'],
                        spaceArena: [{ card: 'awing', upgrades: ['advantage'] }]
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: [{ card: 'wampa', upgrades: ['fulcrum'] }, { card: 'battlefield-marine', upgrades: ['shield'] }],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.clanVizslaSoldier);

                expect(context.player1).toBeAbleToSelectExactly([context.shield, context.fulcrum, context.advantage]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.shield);

                expect(context.player1).toBeActivePlayer();
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            });

            it('should allow defeating an upgrade when defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['clan-vizsla-soldier'],
                        spaceArena: [{ card: 'awing', upgrades: ['advantage'] }]
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: [{ card: 'wampa', upgrades: ['fulcrum'] }, { card: 'battlefield-marine', upgrades: ['shield'] }],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.clanVizslaSoldier);

                expect(context.player2).toBeAbleToSelectExactly([context.shield, context.fulcrum, context.advantage]);
                expect(context.player2).toHavePassAbilityButton();

                context.player2.clickCard(context.advantage);

                expect(context.player1).toBeActivePlayer();
                expect(context.awing).toHaveExactUpgradeNames([]);
            });

            it('should not trigger if there are no upgrades to defeat', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['clan-vizsla-soldier'],
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['wampa'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.clanVizslaSoldier);

                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
