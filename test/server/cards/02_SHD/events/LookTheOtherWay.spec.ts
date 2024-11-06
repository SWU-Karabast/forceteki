describe('Look the Other Way', function () {
    integration(function (contextRef) {
        describe('Look the Other Way\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['look-the-other-way'],
                        groundArena: ['wampa'],
                        base: 'jabbas-palace'
                    },
                    player2: {
                        groundArena: ['viper-probe-droid'],
                    }
                });
            });

            it('should exhaust an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lookTheOtherWay);
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid, context.wampa]);
                context.player1.clickCard(context.viperProbeDroid);

                expect(context.player2).toHaveEnabledPromptButtons(['Exhaust Viper Probe Droid', 'Pay 2 resources']);
                context.player2.clickPrompt('Exhaust Viper Probe Droid');
                expect(context.viperProbeDroid.exhausted).toBeTrue();
                expect(context.player2.countExhaustedResources()).toBe(0);
            });

            it('should exhaust a friendly unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lookTheOtherWay);
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid, context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHaveEnabledPromptButtons(['Exhaust Wampa', 'Pay 2 resources']);
                context.player1.clickPrompt('Exhaust Wampa');
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.player1.countExhaustedResources()).toBe(0);
            });

            it('should does not exhaust unit because controller pays 2 resources (opponent)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lookTheOtherWay);
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid, context.wampa]);
                context.player1.clickCard(context.viperProbeDroid);

                expect(context.player2).toHaveEnabledPromptButtons(['Exhaust Viper Probe Droid', 'Pay 2 resources']);
                context.player2.clickPrompt('Pay 2 resources');
                expect(context.viperProbeDroid.exhausted).toBeFalse();
                expect(context.player2.countExhaustedResources()).toBe(2);
            });

            it('should does not exhaust unit because controller pays 2 resources (friendly)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lookTheOtherWay);
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid, context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHaveEnabledPromptButtons(['Exhaust Wampa', 'Pay 2 resources']);
                context.player1.clickPrompt('Pay 2 resources');
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.player1.countExhaustedResources()).toBe(2);
            });
        });

        describe('Look the Other Way\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['look-the-other-way'],
                        groundArena: ['wampa'],
                        base: 'jabbas-palace'
                    },
                    player2: {
                        groundArena: ['viper-probe-droid'],
                        resources: 1,
                    }
                });
            });

            it('should exhaust an enemy unit without choice because opponent does not have sufficient resources', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lookTheOtherWay);
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid, context.wampa]);
                context.player1.clickCard(context.viperProbeDroid);
                expect(context.viperProbeDroid.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
