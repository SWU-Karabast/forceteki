describe('Frenzied Tri-Fighters', function() {
    integration(function(contextRef) {
        describe('Frenzied Tri-Fighters\'s when played ability', function() {
            it('should defeat an upgrade that costs 3 or less', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['frenzied-trifighters'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['resilient'] }]
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['frozen-in-carbonite'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.frenziedTrifighters);

                expect(context.player1).toBeAbleToSelectExactly([context.resilient, context.frozenInCarbonite]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.frozenInCarbonite);

                expect(context.frozenInCarbonite).toBeInZone('discard', context.player2);
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['resilient']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not be able to target an upgrade that costs more than 3', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['frenzied-trifighters'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['resilient'] }]
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['the-darksaber'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.frenziedTrifighters);

                expect(context.player1).toBeAbleToSelectExactly([context.resilient]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.resilient);

                expect(context.resilient).toBeInZone('discard', context.player1);
                expect(context.wampa).toHaveExactUpgradeNames(['the-darksaber']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to target a Shield or Experience token since they cost 0', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['frenzied-trifighters']
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['shield', 'experience'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.frenziedTrifighters);

                expect(context.player1).toBeAbleToSelectExactly([context.shield, context.experience]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.shield);

                expect(context.wampa).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to decline defeating an upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['frenzied-trifighters']
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['resilient'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.frenziedTrifighters);
                context.player1.clickPrompt('Pass');

                expect(context.wampa).toHaveExactUpgradeNames(['resilient']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when there are no upgrades that cost 3 or less in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['frenzied-trifighters']
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['the-darksaber'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.frenziedTrifighters);

                expect(context.wampa).toHaveExactUpgradeNames(['the-darksaber']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not target Pilot with a unit\'s cost greater than 3', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['frenzied-trifighters']
                    },
                    player2: {
                        hand: ['chewbacca#faithful-first-mate'],
                        spaceArena: [{ card: 'awing', upgrades: ['shield'] }],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.chewbacca);
                context.player2.clickPrompt('Play Chewbacca with Piloting');
                context.player2.clickCard(context.awing);

                context.player1.clickCard(context.frenziedTrifighters);
                expect(context.player1).toBeAbleToSelectExactly([context.shield]);
                context.player1.clickCard(context.shield);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toHaveExactUpgradeNames(['chewbacca#faithful-first-mate']);
            });
        });
    });
});
