describe('Weequay Pirate', () => {
    integration(function (contextRef) {
        describe('When Played ability', function () {
            it('should not give an experience token if played paying resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'chopper-base',
                        hand: ['weequay-pirate']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.weequayPirate);

                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.weequayPirate).toBeInZone('groundArena');
                expect(context.weequayPirate.upgrades.length).toBe(0);
            });

            it('should not give an experience token if Credit tokens partially paid the cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'chopper-base',
                        credits: 1,
                        hand: ['weequay-pirate']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.weequayPirate);
                context.player1.clickPrompt('Use 1 Credit');

                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.weequayPirate).toBeInZone('groundArena');
                expect(context.weequayPirate.upgrades.length).toBe(0);
            });

            it('should give an experience token if Credit tokens paid the full cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'chopper-base',
                        credits: 2,
                        hand: ['weequay-pirate']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.weequayPirate);
                context.player1.clickPrompt('Select amount');
                context.player1.chooseListOption('2');

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.weequayPirate).toBeInZone('groundArena');
                expect(context.weequayPirate.upgrades.length).toBe(1);
                expect(context.weequayPirate).toHaveExactUpgradeNames(['experience']);
            });

            it('should give an experience token if played for free due to a card effect', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: 'chopper-base',
                        hand: ['a-new-adventure'],
                        groundArena: ['weequay-pirate']
                    }
                });

                const { context } = contextRef;

                // Use A New Adventure to bounce Weequay Pirate and replay it for free
                context.player1.clickCard(context.aNewAdventure);
                context.player1.clickCard(context.weequayPirate);

                expect(context.player1).toHavePassAbilityPrompt('Play Weequay Pirate for free');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.exhaustedResourceCount).toBe(2); // From A New Adventure
                expect(context.weequayPirate).toBeInZone('groundArena');
                expect(context.weequayPirate.upgrades.length).toBe(1);
                expect(context.weequayPirate).toHaveExactUpgradeNames(['experience']);
            });

            it('should give an experience token if played for free due to a resource discount', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'chopper-base',
                        hand: ['weequay-pirate', 'sneak-attack']
                    }
                });

                const { context } = contextRef;

                // Use Sneak Attack to play Weequay Pirate for 3R less (making it free)
                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.weequayPirate);

                expect(context.player1.exhaustedResourceCount).toBe(2); // From Sneak Attack
                expect(context.weequayPirate).toBeInZone('groundArena');
                expect(context.weequayPirate.upgrades.length).toBe(1);
                expect(context.weequayPirate).toHaveExactUpgradeNames(['experience']);
            });

            it('should give an experience token if played for free due to droid exhaust from Vuutun Palaa', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'chopper-base',
                        hand: ['weequay-pirate'],
                        groundArena: ['viper-probe-droid', 'drk1-probe-droid'],
                        spaceArena: ['vuutun-palaa#droid-control-ship']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.weequayPirate);
                context.player1.clickPrompt('Pay cost by exhausting units');

                context.player1.clickCard(context.viperProbeDroid);
                context.player1.clickCard(context.drk1ProbeDroid);
                context.player1.clickDone();

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.weequayPirate).toBeInZone('groundArena');
                expect(context.weequayPirate.upgrades.length).toBe(1);
                expect(context.weequayPirate).toHaveExactUpgradeNames(['experience']);
            });

            it('should give an experience token if played for free from discard pile', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'weequay-pirate', upgrades: ['second-chance'] }
                        ]
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                // Player 2 uses Takedown to defeat Weequay Pirate
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.weequayPirate);

                expect(context.weequayPirate).toBeInZone('discard', context.player1);

                // Player 1 uses Second Chance to play Weequay Pirate for free from discard
                context.player1.clickCard(context.weequayPirate);

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.weequayPirate).toBeInZone('groundArena');
                expect(context.weequayPirate.upgrades.length).toBe(1);
                expect(context.weequayPirate).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});