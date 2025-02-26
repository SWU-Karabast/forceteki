describe('Imperial Interceptor', function() {
    integration(function(contextRef) {
        describe('Imperial Interceptor\'s When Played ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['imperial-interceptor'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['system-patrol-craft']
                    },
                    player2: {
                        groundArena: ['wampa', 'superlaser-technician'],
                        spaceArena: ['gladiator-star-destroyer']
                    }
                });
            });

            it('can only select space units, can be passed and can damage a target', function () {
                const { context } = contextRef;

                // Play Imperial Interceptor
                context.player1.clickCard(context.imperialInterceptor);
                expect(context.player1).toHaveEnabledPromptButtons(['Pass']);
                expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.gladiatorStarDestroyer, context.imperialInterceptor]);

                // Select another target and apply damage
                context.player1.clickCard(context.systemPatrolCraft);
                expect(context.systemPatrolCraft.damage).toEqual(3);
            });

            it('can select itself and it is defeated', function () {
                const { context } = contextRef;

                // Play Imperial Interceptor
                context.player1.clickCard(context.imperialInterceptor);
                context.player1.clickCard(context.imperialInterceptor);
                expect(context.imperialInterceptor).toBeInZone('discard');
            });

            it('should be able to be passed', function () {
                const { context } = contextRef;

                // Play Imperial Interceptor
                context.player1.clickCard(context.imperialInterceptor);

                // Pass the ability to damage another unit
                context.player1.clickPrompt('Pass');
                expect(context.imperialInterceptor.damage).toEqual(0);
                expect(context.gladiatorStarDestroyer.damage).toEqual(0);
                expect(context.systemPatrolCraft.damage).toEqual(0);
            });
        });
    });
});
