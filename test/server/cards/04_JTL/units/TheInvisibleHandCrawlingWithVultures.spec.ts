describe('The Invisible Hand, Crawling With Vultures', function() {
    integration(function(contextRef) {
        it('The Invisible Hand should search the top 8 cards of the deck for a Droid when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-invisible-hand#crawling-with-vultures'],
                    deck: ['wampa', 'pyke-sentinel', 'viper-probe-droid',
                        'repair', 'calculating-magnaguard', 'battlefield-marine',
                        'concord-dawn-interceptors', 'drop-in', '21b-surgical-droid'],
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.theInvisibleHand);

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.viperProbeDroid, context.calculatingMagnaguard],
                invalid: [context.wampa, context.pykeSentinel, context.repair,
                    context.battlefieldMarine, context.concordDawnInterceptors, context.dropIn
                ],
            });
            expect(context.player1).not.toHaveEnabledPromptButton('Done');
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            context.player1.clickCardInDisplayCardPrompt(context.calculatingMagnaguard);
            expect(context.calculatingMagnaguard).toBeInZone('hand');
            expect(context.getChatLogs(2)).toContain('player1 takes Calculating MagnaGuard');

            expect(context.player2).toBeActivePlayer();
        });

        it('The Invisible Hand should search the top 8 cards of the deck for a Droid and play it for free if it costs 2 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-invisible-hand#crawling-with-vultures'],
                    deck: ['wampa', 'pyke-sentinel', 'viper-probe-droid',
                        'repair', 'calculating-magnaguard', 'battlefield-marine',
                        'concord-dawn-interceptors', 'drop-in', '21b-surgical-droid'],
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.theInvisibleHand);

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.viperProbeDroid, context.calculatingMagnaguard],
                invalid: [context.wampa, context.pykeSentinel, context.repair,
                    context.battlefieldMarine, context.concordDawnInterceptors, context.dropIn
                ],
            });
            expect(context.player1).not.toHaveEnabledPromptButton('Done');
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            context.player1.clickCardInDisplayCardPrompt(context.viperProbeDroid);
            expect(context.viperProbeDroid).toBeInZone('hand');
            expect(context.getChatLogs(2)).toContain('player1 takes Viper Probe Droid');

            const readyResources = context.player1.readyResourceCount;

            expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.viperProbeDroid]);
            expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play it for free', 'Leave it in your hand']);
            context.player1.clickDisplayCardPromptButton(context.viperProbeDroid.uuid, 'play');
            expect(context.viperProbeDroid).toBeInZone('groundArena');
            expect(context.player1.readyResourceCount).toBe(readyResources);

            expect(context.player2).toBeActivePlayer();
        });

        it('The Invisible Hand should search the top 8 cards of the deck for a Droid on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['the-invisible-hand#crawling-with-vultures'],
                    deck: ['wampa', 'pyke-sentinel', 'viper-probe-droid',
                        'repair', 'calculating-magnaguard', 'battlefield-marine',
                        'concord-dawn-interceptors', 'drop-in', '21b-surgical-droid'],
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.theInvisibleHand);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.viperProbeDroid, context.calculatingMagnaguard],
                invalid: [context.wampa, context.pykeSentinel, context.repair,
                    context.battlefieldMarine, context.concordDawnInterceptors, context.dropIn
                ],
            });
            expect(context.player1).not.toHaveEnabledPromptButton('Done');
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            context.player1.clickCardInDisplayCardPrompt(context.calculatingMagnaguard);
            expect(context.calculatingMagnaguard).toBeInZone('hand');
            expect(context.getChatLogs(2)).toContain('player1 takes Calculating MagnaGuard');

            expect(context.player2).toBeActivePlayer();
        });
    });
});
