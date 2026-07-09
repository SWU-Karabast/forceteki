describe('Boba Fett, Compensated If He Dies', function () {
    integration(function (contextRef) {
        describe('', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['boba-fett#compensated-if-he-dies', 'wampa'],
                    },
                    player2: {
                        groundArena: ['atst', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;
                context.player1.exhaustResources(3);
            });

            it('Boba Fett\'s ability should ready 2 resources if the defender was defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Ready 2 resources');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('Boba Fett\'s ability should ready 2 resources if the defender was defeated (can pass)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Ready 2 resources');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('Boba Fett\'s ability should not ready 2 resources if the defender was not defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('Boba Fett\'s ability should not ready 2 resources if attacking base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('Boba Fett\'s ability should not ready 2 resources when the defender is defeated by other friendly unit or when Boba\'s attack ends (like SOR Boba\'s ability)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);

                context.player2.passAction();

                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });
        });
    });
});
