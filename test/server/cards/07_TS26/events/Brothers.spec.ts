describe('Brothers', function () {
    integration(function (contextRef) {
        describe('Brothers\' ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['brothers'],
                        groundArena: ['grand-inquisitor#youre-right-to-be-afraid', 'battlefield-marine'],
                        spaceArena: ['mist-hunter#the-findsmans-pursuit'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer', 'awing']
                    }
                });
            });

            it('should initiate 2 attacks with combat prevention', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.brothers);
                expect(context.player1).toBeAbleToSelectExactly([context.mistHunter, context.grandInquisitor, context.chirrutImwe]);

                context.player1.clickCard(context.mistHunter);
                context.player1.clickCard(context.cartelSpacer);
                expect(context.mistHunter.damage).toBe(0);
                expect(context.cartelSpacer).toBeInZone('discard');

                context.player1.clickCard(context.grandInquisitor);
                context.player1.clickCard(context.wampa);
                expect(context.grandInquisitor.damage).toBe(0);
                expect(context.wampa.damage).toBe(4);

                expect(context.player2).toBeActivePlayer();
            });

            it('should initiate only 1 attack with +1/+0', function () {
                const { context } = contextRef;

                context.exhaustCard(context.mistHunter);
                context.exhaustCard(context.chirrutImwe);

                context.player1.clickCard(context.brothers);
                context.player1.clickCard(context.grandInquisitor);
                context.player1.clickCard(context.wampa);
                expect(context.grandInquisitor.damage).toBe(0);
                expect(context.wampa.damage).toBe(4);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});