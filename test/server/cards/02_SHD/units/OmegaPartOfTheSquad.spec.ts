describe('Omega, Part of the Squad', function() {
    integration(function(contextRef) {
        describe('Omega\'s Ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['omega#part-of-the-squad'],
                        deck: ['crosshair#following-orders', 'pyke-sentinel', 'atst', 'cartel-spacer', 'battlefield-marine'],
                        base: 'echo-base',
                        leader: 'hera-syndulla#spectre-two'
                    }
                });
            });

            it('can draw a clone', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.omega);
                expect(context.player1).toHavePrompt('Select a card to reveal');
                expect(context.player1).toHaveEnabledPromptButton(context.crosshair.title);
                expect(context.player1).toHaveDisabledPromptButtons([context.atst.title, context.battlefieldMarine.title, context.cartelSpacer.title, context.pykeSentinel.title]);
                context.player1.clickPrompt(context.crosshair.title);
                expect(context.crosshair).toBeInLocation('hand');
                expect(context.getChatLogs(2)).toContain('player1 takes Crosshair');

                // Omega should cost 4 since it cannot discount itself
                expect(context.player1.countExhaustedResources()).toBe(4);

                context.player2.passAction();

                // Crosshair should cost 6 since Omega was the first Clone played this round
                context.player1.clickCard(context.crosshair);
                expect(context.player1.countExhaustedResources()).toBe(10);
            });
        });

        describe('Omega\'s Ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['omega#part-of-the-squad'],
                        hand: ['crosshair#following-orders', 'wolffe#suspicious-veteran'],
                        base: 'echo-base',
                        leader: 'hera-syndulla#spectre-two'
                    },
                });
            });

            it('negates aspect penalties on the first clone played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.crosshair);
                expect(context.player1.countExhaustedResources()).toBe(4);

                context.player2.passAction();

                // This should cost 4 due to aspect penalties
                context.player1.clickCard(context.wolffe);
                expect(context.player1.countExhaustedResources()).toBe(8);
            });
        });
    });
});
