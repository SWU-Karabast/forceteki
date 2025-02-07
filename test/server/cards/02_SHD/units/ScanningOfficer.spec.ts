describe('Scanning Officer', function () {
    integration(function (contextRef) {
        it('should reveal and defeat enemy resources that have Smuggle', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['scanning-officer'],
                },
                player2: {
                    resources: ['pyke-sentinel', 'collections-starhopper', 'reckless-gunslinger']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.scanningOfficer);

            expect(context.player1).toHaveExactViewableDisplayPromptCards([context.pykeSentinel, context.collectionsStarhopper, context.recklessGunslinger]);
            expect(context.getChatLogs(1)[0]).toContain(context.pykeSentinel.title);
            expect(context.getChatLogs(1)[0]).toContain(context.collectionsStarhopper.title);
            expect(context.getChatLogs(1)[0]).toContain(context.recklessGunslinger.title);
            context.player1.clickPrompt('Done');

            expect(context.collectionsStarhopper).toBeInZone('discard');
            expect(context.recklessGunslinger).toBeInZone('discard');
            expect(context.player2.resources.length).toBe(3);
            expect(context.player2.readyResourceCount).toBe(1);
        });

        it('should reveal and defeat all chosen resources if the opponent has Tech on the board', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['scanning-officer'],
                },
                player2: {
                    groundArena: ['tech#source-of-insight'],
                    resources: ['wampa', 'pyke-sentinel', 'moisture-farmer']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.scanningOfficer);

            expect(context.player1).toHaveExactViewableDisplayPromptCards([context.wampa, context.pykeSentinel, context.moistureFarmer]);
            expect(context.getChatLogs(1)[0]).toContain(context.wampa.title);
            expect(context.getChatLogs(1)[0]).toContain(context.pykeSentinel.title);
            expect(context.getChatLogs(1)[0]).toContain(context.moistureFarmer.title);
            context.player1.clickPrompt('Done');

            expect(context.wampa).toBeInZone('discard');
            expect(context.pykeSentinel).toBeInZone('discard');
            expect(context.moistureFarmer).toBeInZone('discard');
            expect(context.player2.resources.length).toBe(3);
            expect(context.player2.readyResourceCount).toBe(0);
        });
    });
});