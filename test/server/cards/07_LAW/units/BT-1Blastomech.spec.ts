describe('BT-1, Blastomech', function () {
    integration(function (contextRef) {
        describe('BT-1\'s ability', function () {
            it('should deal 1 damage to a ground unit if the discarded card is Aggression', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['bt1#blastomech', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        deck: ['daring-raid']
                    },
                    player2: {
                        groundArena: ['greedo#slow-on-the-draw', 'atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bt1Blastomech);
                context.player1.clickCard(context.p2Base);
                expect(context.daringRaid).toBeInZone('discard');

                expect(context.player1).toHaveEnabledPromptButton('Pass');

                expect(context.player1).toBeAbleToSelectExactly([context.bt1Blastomech, context.battlefieldMarine, context.atst, context.greedoSlowOnTheDraw]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.damage).toBe(1);
            });

            it('should not deal 1 damage to a ground unit if the discarded card is not Aggression', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['bt1#blastomech', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        deck: ['surprise-strike']
                    },
                    player2: {
                        groundArena: ['greedo#slow-on-the-draw', 'atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bt1Blastomech);
                context.player1.clickCard(context.p2Base);
                expect(context.surpriseStrike).toBeInZone('discard');

                expect(context.player1).not.toHavePrompt('Deal 1 damage to a ground unit');

                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.bt1Blastomech.damage).toBe(0);
                expect(context.atst.damage).toBe(0);
                expect(context.greedoSlowOnTheDraw.damage).toBe(0);
            });

            it('should not prompt if the deck is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['bt1#blastomech', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        deck: []
                    },
                    player2: {
                        groundArena: ['greedo#slow-on-the-draw', 'atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bt1Blastomech);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).not.toHavePrompt('Deal 1 damage to a ground unit');

                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.bt1Blastomech.damage).toBe(0);
                expect(context.atst.damage).toBe(0);
                expect(context.greedoSlowOnTheDraw.damage).toBe(0);
            });
        });
    });
});