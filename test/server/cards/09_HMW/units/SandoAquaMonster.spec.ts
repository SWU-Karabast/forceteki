describe('Sando Aqua Monster', function() {
    integration(function(contextRef) {
        describe('Sando Aqua Monster\'s when played ability', function() {
            it('should defeat ground units up to its power and deal that damage to itself when you control a Naboo base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sando-aqua-monster'],
                        base: 'great-grass-plains'
                    },
                    player2: {
                        groundArena: ['wampa', 'spy', 'porg', 'battlefield-marine', 'atst'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sandoAquaMonster);

                expect(context.player1).toHavePrompt('Choose any number of ground units with combined power equal to or less than 5');
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.spy, context.porg, context.battlefieldMarine, context.sandoAquaMonster]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.spy, context.battlefieldMarine]);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.porg);
                context.player1.clickCard(context.spy);
                context.player1.clickDone();

                expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
                expect(context.porg).toBeInZone('discard', context.player2);
                expect(context.spy).toBeInZone('outsideTheGame', context.player2);
                expect(context.sandoAquaMonster.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat ground units up to its power and deal that damage to itself when you control a Naboo base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sando-aqua-monster'],
                        groundArena: ['the-son#embodiment-of-darkness'],
                        hasForceToken: true,
                        base: 'great-grass-plains'
                    },
                    player2: {
                        groundArena: ['wampa', 'spy', 'porg', 'battlefield-marine', 'atst'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sandoAquaMonster);

                expect(context.player1).toHavePrompt('Choose any number of ground units with combined power equal to or less than 7');
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);
                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.sandoAquaMonster.damage).toBe(7);
            });

            it('should do nothing when passed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sando-aqua-monster'],
                        base: 'great-grass-plains'
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sandoAquaMonster);

                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.sandoAquaMonster.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should do when we do not control a Naboo base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sando-aqua-monster'],
                        base: 'energy-conversion-lab'
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sandoAquaMonster);

                expect(context.player2).toBeActivePlayer();
                expect(context.sandoAquaMonster.damage).toBe(0);
            });
        });
    });
});
