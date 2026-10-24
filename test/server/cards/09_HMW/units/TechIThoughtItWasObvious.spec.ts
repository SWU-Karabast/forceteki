describe('Tech, I Thought It Was Obvious', function() {
    integration(function(contextRef) {
        describe('Tech\'s ability', function() {
            it('should let the controller exhaust any unit when Tech is dealt damage (event) and survives', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid'],
                        groundArena: ['tech#i-thought-it-was-obvious', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.tech);

                expect(context.tech.damage).toBe(2);
                expect(context.player1).toBeAbleToSelectExactly([context.tech, context.battlefieldMarine, context.wampa, context.awing]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.wampa.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should let the controller exhaust any unit when Tech is dealt damage (combat) and survives', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid'],
                        groundArena: ['tech#i-thought-it-was-obvious', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa', 'porg'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tech);
                context.player1.clickCard(context.porg);

                expect(context.player1).toBeAbleToSelectExactly([context.tech, context.battlefieldMarine, context.wampa, context.awing]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.exhausted).toBeTrue();
            });

            it('should do nothing if the controller passes the optional exhaust', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid'],
                        groundArena: ['tech#i-thought-it-was-obvious', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.tech);

                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.wampa.exhausted).toBeFalse();
                expect(context.tech.exhausted).toBeFalse();
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when Tech is defeated by damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['tech#i-thought-it-was-obvious'],
                    },
                    player2: {
                        groundArena: ['wrecker#wrecking-the-empire'],
                        spaceArena: ['awing'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.wrecker);
                context.player2.clickCard(context.tech);

                expect(context.tech).toBeInZone('discard');
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
