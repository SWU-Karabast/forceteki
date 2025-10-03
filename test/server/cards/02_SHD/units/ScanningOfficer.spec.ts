describe('Scanning Officer', function () {
    integration(function (contextRef) {
        it('should reveal and not defeat enemy resources that don\'t have Smuggle', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['scanning-officer'],
                },
                player2: {
                    resources: ['pyke-sentinel', 'wampa', 'karabast']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.scanningOfficer);

            expect(context.player1).toHaveExactViewableDisplayPromptCards([context.pykeSentinel, context.wampa, context.karabast]);
            expect(context.getChatLogs(1)[0]).toContain(context.pykeSentinel.title);
            expect(context.getChatLogs(1)[0]).toContain(context.wampa.title);
            expect(context.getChatLogs(1)[0]).toContain(context.karabast.title);
            context.player1.clickDone();

            expect(context.pykeSentinel).toBeInZone('resource');
            expect(context.wampa).toBeInZone('resource');
            expect(context.karabast).toBeInZone('resource');
            expect(context.player2.resources.length).toBe(3);
            expect(context.player2.readyResourceCount).toBe(3);
        });

        it('should reveal and defeat enemy resources that have Smuggle', async function () {
            await contextRef.setupTestAsync({
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
            context.player1.clickDone();

            expect(context.collectionsStarhopper).toBeInZone('discard');
            expect(context.recklessGunslinger).toBeInZone('discard');
            expect(context.player2.resources.length).toBe(3);
            expect(context.player2.readyResourceCount).toBe(1);
        });

        it('should reveal and defeat enemy resources that have Smuggle and work correctly if the opponent\'s deck is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['scanning-officer'],
                },
                player2: {
                    resources: ['pyke-sentinel', 'collections-starhopper', 'reckless-gunslinger'],
                    deck: []
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.scanningOfficer);

            expect(context.player1).toHaveExactViewableDisplayPromptCards([context.pykeSentinel, context.collectionsStarhopper, context.recklessGunslinger]);
            expect(context.getChatLogs(1)[0]).toContain(context.pykeSentinel.title);
            expect(context.getChatLogs(1)[0]).toContain(context.collectionsStarhopper.title);
            expect(context.getChatLogs(1)[0]).toContain(context.recklessGunslinger.title);
            context.player1.clickDone();

            expect(context.collectionsStarhopper).toBeInZone('discard');
            expect(context.recklessGunslinger).toBeInZone('discard');
            expect(context.player2.resources.length).toBe(1);
            expect(context.player2.readyResourceCount).toBe(1);
        });

        it('should shuffle resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['scanning-officer'],
                },
                player2: {
                    leader: { card: 'boba-fett#daimyo', exhausted: true },
                    resources: [
                        { card: 'pyke-sentinel', exhausted: true },
                        'collections-starhopper',
                        'reckless-gunslinger',
                        { card: 'wampa', exhausted: true },
                        'moisture-farmer',
                        'armed-to-the-teeth'
                    ]
                }
            });

            const { context } = contextRef;
            context.game.setRandomSeed('abcdefgh');

            context.player1.clickCard(context.scanningOfficer);

            // Resources were shuffled
            expect(context.wampa.exhausted).toBe(false);

            expect(context.player1).toHaveExactViewableDisplayPromptCards([context.wampa, context.recklessGunslinger, context.armedToTheTeeth]);
            expect(context.getChatLogs(1)[0]).toContain(context.wampa.title);
            expect(context.getChatLogs(1)[0]).toContain(context.recklessGunslinger.title);
            expect(context.getChatLogs(1)[0]).toContain(context.armedToTheTeeth.title);
            context.player1.clickDone();

            expect(context.recklessGunslinger).toBeInZone('discard');
            expect(context.armedToTheTeeth).toBeInZone('discard');
            expect(context.player2.resources.length).toBe(6);
            expect(context.player2.readyResourceCount).toBe(3);
            expect(context.getChatLogs(3)).toEqual([
                'player1 plays Scanning Officer',
                'player1 uses Scanning Officer to randomly select 3 cards, and to reveal Reckless Gunslinger, Armed to the Teeth, and Wampa',
                'player1 uses Scanning Officer to defeat a ready Reckless Gunslinger and an exhausted Armed to the Teeth and to move 2 cards to player2\'s resources',
            ]);
        });

        it('should reveal and defeat all chosen resources if the opponent has Tech on the board', async function () {
            await contextRef.setupTestAsync({
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
            context.player1.clickDone();

            expect(context.wampa).toBeInZone('discard');
            expect(context.pykeSentinel).toBeInZone('discard');
            expect(context.moistureFarmer).toBeInZone('discard');
            expect(context.player2.resources.length).toBe(3);
            expect(context.player2.readyResourceCount).toBe(0);
        });
    });
});