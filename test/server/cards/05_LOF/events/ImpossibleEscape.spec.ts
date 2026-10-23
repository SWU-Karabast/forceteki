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
            expect(context.player1).toHavePrompt('Choose an effect. If you do either, exhaust an enemy unit and draw a card');
            expect(context.player1).toHaveExactPromptButtons([
                'Exhaust a friendly unit',
                'Use the Force',
                'Pass'
            ]);

            // Resolve the first effect
            context.player1.clickPrompt('Use the Force');
            expect(context.player1.hasTheForce).toBeFalse();
            expect(context.atst.exhausted).toBeFalse();

            // Resolve the second effect
            expect(context.player1).toHavePrompt('Exhaust an enemy unit');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

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
            expect(context.player1).toHavePrompt('Choose an effect. If you do either, exhaust an enemy unit and draw a card');
            expect(context.player1).toHaveEnabledPromptButtons([
                'Exhaust a friendly unit',
                'Use the Force',
                'Pass'
            ]);

            context.player1.clickPrompt('Exhaust a friendly unit');
            expect(context.player1).toBeAbleToSelectExactly([context.atst]);
            context.player1.clickCard(context.atst);
            expect(context.player1.hasTheForce).toBeTrue();
            expect(context.atst.exhausted).toBeTrue();

            expect(context.player1).toHavePrompt('Exhaust an enemy unit');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.wampa).toBeInZone('hand', context.player1);
        });

        it('cannot choose to use the force if there is no Force token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['impossible-escape'],
                    deck: ['wampa'],
                    groundArena: ['atst'],
                    hasForceToken: false,
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.impossibleEscape);
            expect(context.player1).toHavePrompt('Choose an effect. If you do either, exhaust an enemy unit and draw a card');
            expect(context.player1).toHaveEnabledPromptButtons([
                'Exhaust a friendly unit',
                'Pass'
            ]);

            context.player1.clickPrompt('Pass');
            expect(context.player2).toBeActivePlayer();
        });

        it('cannot choose to exhaust a friendly unit if there are no friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['impossible-escape'],
                    deck: ['wampa'],
                    hasForceToken: true,
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.impossibleEscape);
            expect(context.player1).toHavePrompt('Choose an effect. If you do either, exhaust an enemy unit and draw a card');
            expect(context.player1).toHaveEnabledPromptButtons([
                'Use the Force',
                'Pass',
            ]);

            context.player1.clickPrompt('Pass');
            expect(context.player2).toBeActivePlayer();
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
                expect(context.player1).toHavePrompt('Choose an effect. If you do either, exhaust an enemy unit and draw a card');
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Exhaust a friendly unit',
                    'Use the Force',
                    'Pass',
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
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.impossibleEscape);
                expect(context.player1).toHavePrompt('Choose an effect. If you do either, exhaust an enemy unit and draw a card');
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Exhaust a friendly unit',
                    'Use the Force',
                    'Pass',
                ]);

                context.player1.clickPrompt('Exhaust a friendly unit');
                expect(context.player1).toBeAbleToSelectExactly([context.atst]);

                context.player1.clickCard(context.atst);
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
                expect(context.player1).toHavePrompt('Choose an effect. If you do either, exhaust an enemy unit and draw a card');
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Use the Force',
                    'Pass',
                ]);

                context.player1.clickPrompt('Use the Force');
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