describe('Omega, Part of the Squad', function() {
    integration(function(contextRef) {
        describe('Omega\'s Ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['omega#part-of-the-squad', 'omega#part-of-the-squad'],
                        deck: ['crosshair#following-orders', 'pyke-sentinel', 'atst', 'cartel-spacer', 'battlefield-marine'],
                        base: 'echo-base',
                        leader: 'hera-syndulla#spectre-two'
                    }
                });
                const { context } = contextRef;
                const p1Omegas = context.player1.findCardsByName('omega#part-of-the-squad');
                context.firstOmega = p1Omegas[0];
                context.secondOmega = p1Omegas[1];
            });

            it('can draw a clone', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.firstOmega);
                expect(context.player1).toHavePrompt('Select a card to reveal');
                expect(context.player1).toHaveEnabledPromptButton(context.crosshair.title);
                expect(context.player1).toHaveDisabledPromptButtons([context.atst.title, context.battlefieldMarine.title, context.cartelSpacer.title, context.pykeSentinel.title]);
                context.player1.clickPrompt(context.crosshair.title);
                expect(context.crosshair).toBeInZone('hand');
                expect(context.getChatLogs(2)).toContain('player1 takes Crosshair');

                // Omega should cost 4 since it cannot discount itself
                expect(context.player1.exhaustedResourceCount).toBe(4);

                context.player2.passAction();

                // Crosshair should cost 6 since Omega was the first Clone played this round
                context.player1.clickCard(context.crosshair);
                expect(context.player1.exhaustedResourceCount).toBe(10);

                context.moveToNextActionPhase();

                expect(context.player1.exhaustedResourceCount).toBe(0);
                context.player1.clickCard(context.secondOmega);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                // so we don't need to go all the way through the Omega ability again
                context.allowTestToEndWithOpenPrompt = true;
            });
        });

        describe('Omega\'s Ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['omega#part-of-the-squad'],
                        hand: ['crosshair#following-orders', 'wolffe#suspicious-veteran', 'seasoned-shoretrooper'],
                        base: 'echo-base',
                        leader: 'hera-syndulla#spectre-two'
                    },
                });
            });

            it('negates aspect penalties on the first clone played', function () {
                const { context } = contextRef;

                // shore trooper first -- should be +2 aspect penalty for 4
                context.player1.clickCard(context.seasonedShoretrooper);
                expect(context.player1.exhaustedResourceCount).toBe(4);

                context.player2.passAction();

                // crosshair next -- should be 4 resources as it ignores aspect penalties
                context.player1.clickCard(context.crosshair);
                expect(context.player1.exhaustedResourceCount).toBe(8);

                // This should cost +2 aspect penalty for 4
                context.player1.clickCard(context.wolffe);
                expect(context.player1.exhaustedResourceCount).toBe(12);
            });
        });
    });
});
