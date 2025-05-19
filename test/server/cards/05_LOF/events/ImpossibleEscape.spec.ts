describe('Impossible Escape ability', function () {
    integration(function (contextRef) {
        it('can use the Force to exhaust an enemy unit and to draw a card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['impossible-escape'],
                    deck: ['wampa'],
                    groundArena: ['atst'],
                    hasForceToken: true,
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.impossibleEscape);
            expect(context.player1).toHavePassAbilityPrompt('Exhaust a friendly unit or use the Force. If you do either, exhaust an enemy unit and draw a card');

            context.player1.clickPrompt('Trigger');
            expect(context.player1).toHaveEnabledPromptButtons([
                'Use the Force',
                'Exhaust a friendly unit',
            ]);

            context.player1.clickPrompt('Use the Force');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.hasTheForce).toBeFalse();
            expect(context.atst.exhausted).toBeFalse();
            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.wampa).toBeInZone('hand', context.player1);
        });

        it('can exhaust a friendly unit to exhaust an enemy unit and to draw a card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['impossible-escape'],
                    deck: ['wampa'],
                    groundArena: ['atst'],
                    hasForceToken: true,
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.impossibleEscape);
            expect(context.player1).toHavePassAbilityPrompt('Exhaust a friendly unit or use the Force. If you do either, exhaust an enemy unit and draw a card');

            context.player1.clickPrompt('Trigger');
            expect(context.player1).toHaveEnabledPromptButtons([
                'Use the Force',
                'Exhaust a friendly unit',
            ]);

            context.player1.clickPrompt('Exhaust a friendly unit');
            expect(context.player1).toBeAbleToSelectExactly([context.atst]);

            context.player1.clickCard(context.atst);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.hasTheForce).toBeTrue();
            expect(context.atst.exhausted).toBeTrue();
            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.wampa).toBeInZone('hand', context.player1);
        });

        describe('when the opponent has no units', function () {
            it('can use the Force to draw a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['impossible-escape'],
                        deck: ['wampa'],
                        groundArena: ['atst'],
                        hasForceToken: true,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.impossibleEscape);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust a friendly unit or use the Force. If you do either, exhaust an enemy unit and draw a card');

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Use the Force',
                    'Exhaust a friendly unit',
                ]);

                context.player1.clickPrompt('Use the Force');
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.atst.exhausted).toBeFalse();
                expect(context.wampa).toBeInZone('hand', context.player1);
            });

            it('can exhaust a friendly unit to draw a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['impossible-escape'],
                        deck: ['wampa'],
                        groundArena: ['atst'],
                        hasForceToken: true,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.impossibleEscape);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust a friendly unit or use the Force. If you do either, exhaust an enemy unit and draw a card');

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Use the Force',
                    'Exhaust a friendly unit',
                ]);

                context.player1.clickPrompt('Exhaust a friendly unit');
                expect(context.player1).toBeAbleToSelectExactly([context.atst]);

                context.player1.clickCard(context.atst);
                expect(context.player1.hasTheForce).toBeTrue();
                expect(context.atst.exhausted).toBeTrue();
                expect(context.wampa).toBeInZone('hand', context.player1);
            });
        });

        describe('on an empty board', function () {
            it('can be used to use the Force and draw a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['impossible-escape'],
                        deck: ['wampa'],
                        hasForceToken: true,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.impossibleEscape);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust a friendly unit or use the Force. If you do either, exhaust an enemy unit and draw a card');

                context.player1.clickPrompt('Trigger');
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.player1.handSize).toBe(1);
            });

            it('can be used to do nothing', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['impossible-escape'],
                        hasForceToken: false,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.impossibleEscape);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(0);
            });
        });
    });
});