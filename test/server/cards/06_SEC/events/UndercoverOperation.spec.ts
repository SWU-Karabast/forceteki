describe('Undercover Operation', function () {
    integration(function (contextRef) {
        describe('Undercover Operation\'s ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['undercover-operation', 'wampa', 'yoda#old-master'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        hand: ['atst']
                    }
                });
            });

            it('should ready a unit played this phase and do not create a spy token if target costs more than 3', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player2.clickCard(context.atst);

                context.player1.clickCard(context.undercoverOperation);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.exhausted).toBeFalse();

                const spies = context.player1.findCardsByName('spy');
                expect(spies.length).toBe(0);
            });

            it('should ready a unit played this phase and create a spy token if target costs 3 or less', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player2.clickCard(context.atst);

                context.player1.clickCard(context.undercoverOperation);
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.atst]);
                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.yoda.exhausted).toBeFalse();

                const spies = context.player1.findCardsByName('spy');
                expect(spies.length).toBe(1);
            });
        });

        it('should not ready a unit played, captured and rescue this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['undercover-operation', 'takedown', 'yoda#old-master'],
                },
                player2: {
                    hand: ['discerning-veteran'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.yoda);

            context.player2.clickCard(context.discerningVeteran);
            context.player2.clickCard(context.yoda);

            context.player1.clickCard(context.takedown);
            context.player1.clickCard(context.discerningVeteran);

            context.player2.passAction();

            context.player1.clickCard(context.undercoverOperation);
            expect(context.player1).toHavePrompt('Playing Undercover Operation will have no effect. Are you sure you want to play it?');
            context.player1.clickPrompt('Play anyway');

            expect(context.player2).toBeActivePlayer();
        });
    });
});