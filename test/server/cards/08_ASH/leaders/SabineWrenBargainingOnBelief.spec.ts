describe('Sabine Wren, Bargaining On Belief', function() {
    integration(function(contextRef) {
        describe('Leader side triggered ability', function() {
            it('should give 2 Advantage tokens to an enemy unit and the next unit you play this Phase gains Shielded this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa', 'yoda#old-master', 'the-armorer#secrecy-is-our-survival'],
                        leader: 'sabine-wren#bargaining-on-belief',
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickPrompt('An opponent gives 2 Advantage tokens to a unit they control. If they do, the next unit you play this phase gains Shielded for this phase');

                expect(context.player1).toHavePrompt('Waiting for opponent to select a unit for Sabine Wren\'s ability');
                expect(context.player2).toHavePrompt('Choose a unit to give 2 Advantage tokens. The next unit your opponent plays this phase gains Shielded for this phase');

                expect(context.player2).toBeAbleToSelectExactly([context.atst, context.awing]);
                expect(context.player2).not.toHavePassAbilityButton();
                expect(context.player2).not.toHaveChooseNothingButton();

                context.player2.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst).toHaveExactUpgradeNames(['advantage', 'advantage']);
                expect(context.getChatLog(1)).toBe('player1 uses Sabine Wren, exhausting Sabine Wren to have player2 give 2 Advantage tokens to AT-ST to create a delayed effect');
                expect(context.getChatLog()).toBe('player1 uses Sabine Wren to give Shielded to the next unit they play this phase');

                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toHaveExactUpgradeNames(['shield']);

                context.player2.passAction();

                context.player1.clickCard(context.yoda);
                expect(context.player2).toBeActivePlayer();
                expect(context.yoda).toHaveExactUpgradeNames([]);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.theArmorer);
                context.player1.clickPrompt('Shielded');
                expect(context.player2).toBeActivePlayer();

                // wampa had lost his keyword and do not gain another one from The Armorer WP
                expect(context.wampa).toHaveExactUpgradeNames(['shield']);
                expect(context.yoda).toHaveExactUpgradeNames([]);
            });

            it('should not work on next phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa'],
                        leader: 'sabine-wren#bargaining-on-belief',
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickPrompt('An opponent gives 2 Advantage tokens to a unit they control. If they do, the next unit you play this phase gains Shielded for this phase');
                context.player2.clickCard(context.atst);

                expect(context.atst).toHaveExactUpgradeNames(['advantage', 'advantage']);

                context.moveToNextActionPhase();

                // delayed effect expire on phase
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames([]);
            });

            it('should not work if enemy does not have any unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa'],
                        leader: 'sabine-wren#bargaining-on-belief',
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickPrompt('(No effect) An opponent gives 2 Advantage tokens to a unit they control. If they do, the next unit you play this phase gains Shielded for this phase');

                expect(context.player2).toBeActivePlayer();
                expect(context.getChatLog()).toBe('player1 attempted to use Sabine Wren, but there are insufficient legal targets');
                expect(context.sabineWren.exhausted).toBeTrue();

                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames([]);
            });
        });

        describe('Leader unit side triggered ability', function() {
            it('should create a delayed effect, the next unit you play this phase gains Shielded for the phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa', 'yoda#old-master', 'the-armorer#secrecy-is-our-survival'],
                        leader: { card: 'sabine-wren#bargaining-on-belief', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['awing']
                    }
                });


                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();
                context.player1.clickCard(context.wampa);
                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toHaveExactUpgradeNames(['shield']);

                context.player2.passAction();

                context.player1.clickCard(context.yoda);
                expect(context.player2).toBeActivePlayer();
                expect(context.yoda).toHaveExactUpgradeNames([]);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.theArmorer);
                context.player1.clickPrompt('Shielded');
                expect(context.player2).toBeActivePlayer();

                // wampa had lost his keyword and do not gain another one from The Armorer WP
                expect(context.wampa).toHaveExactUpgradeNames(['shield']);
                expect(context.yoda).toHaveExactUpgradeNames([]);
            });

            it('should not work on the next phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa'],
                        leader: { card: 'sabine-wren#bargaining-on-belief', deployed: true },
                    },
                });


                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                context.moveToNextActionPhase();

                context.player1.clickCard(context.wampa);
                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toHaveExactUpgradeNames([]);
            });
        });
    });
});
