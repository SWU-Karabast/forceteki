describe('Unauthorized Investigation', function () {
    integration(function (contextRef) {
        describe('Unauthorized Investigation\'s ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['unauthorized-investigation', 'daring-raid'],
                    },
                });
            });

            it('creates a Spy token, then, after disclosing Aggression, it creates another spy token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.unauthorizedInvestigation);

                const spy = context.player1.findCardsByName('spy');
                expect(spy.length).toBe(1);
                expect(spy[0]).toBeInZone('groundArena');
                expect(spy[0].exhausted).toBeTrue();

                expect(context.player1).toBeAbleToSelectExactly([context.daringRaid]);
                context.player1.clickCard(context.daringRaid);

                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.daringRaid]);
                context.player2.clickDone();

                const spy2 = context.player1.findCardsByName('spy');
                expect(spy2.length).toBe(2);
                expect(spy2[0]).toBeInZone('groundArena');
                expect(spy2[0].exhausted).toBeTrue();
                expect(spy2[1]).toBeInZone('groundArena');
                expect(spy2[1].exhausted).toBeTrue();
            });

            it('allows passing on disclose, only creates one Spy', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.unauthorizedInvestigation);

                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickPrompt('Choose nothing');

                const spy = context.player1.findCardsByName('spy');
                expect(spy.length).toBe(1);
                expect(spy[0]).toBeInZone('groundArena');
                expect(spy[0].exhausted).toBeTrue();
            });
        });
    });
});