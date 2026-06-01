describe('Qira, Master Of Teras Kasi', function() {
    integration(function(contextRef) {
        describe('Qira, Master Of Teras Kasi\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['qira#master-of-teras-kasi', 'porg', 'wampa', 'takedown', 'fulcrum'],
                        spaceArena: ['mynock']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['awing']
                    }
                });
            });

            it('', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.qira);

                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.wampa, context.takedown, context.fulcrum]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(context.takedown);

                expect(context.player1).toBeAbleToSelectExactly([context.qira, context.mynock, context.atst, context.awing]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(3);
                expect(context.takedown).toBeInZone('discard', context.player1);

                expect(context.qira.getPower()).toBe(6);
                expect(context.qira.getHp()).toBe(7);
            });

            it('', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.qira);

                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.wampa, context.takedown, context.fulcrum]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickPrompt('Choose nothing');

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(0);
                expect(context.awing.damage).toBe(0);
                expect(context.qira.damage).toBe(0);
                expect(context.mynock.damage).toBe(0);

                expect(context.qira.getPower()).toBe(5);
                expect(context.qira.getHp()).toBe(7);
            });
        });
    });
});
