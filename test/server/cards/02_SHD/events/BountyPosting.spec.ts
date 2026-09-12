describe('Bounty Posting', function() {
    integration(function(contextRef) {
        describe('Bounty Posting\'s ability', function() {
            it('should be able to search your deck for a bounty upgrade (shuffling deck) and then play it for its cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bounty-posting'],
                        deck: ['death-mark', 'tieln-fighter', 'top-target', 'cell-block-guard', 'pyke-sentinel', 'hylobon-enforcer'],
                        base: 'chopper-base'
                    },
                    player2: {
                        groundArena: ['clone-trooper']
                    }
                });

                const { context } = contextRef;

                // Seeded so the shuffle result is identical on every run.
                context.game.setRandomSeed('12345');

                context.player1.clickCard(context.bountyPosting);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.deathMark, context.topTarget],
                    invalid: [context.tielnFighter, context.cellBlockGuard, context.pykeSentinel, context.hylobonEnforcer]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.topTarget);

                // P2 is prompted to see the revealed card
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.topTarget]);
                context.player2.clickDone();

                expect(context.topTarget).toBeInZone('hand', context.player1);
                expect(context.player1).toHavePassAbilityPrompt('Play that upgrade (paying its cost)');

                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays Bounty Posting to search their deck',
                    'player1 uses Bounty Posting to reveal and draw Top Target and to shuffle their deck'
                ]);

                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.cloneTrooper);
                expect(context.cloneTrooper).toHaveExactUpgradeNames(['top-target']);

                // Top Target was drawn; the remaining cards were shuffled into this deterministic order.
                expect(context.player1.deck.map((c) => c.internalName)).toEqual([
                    'death-mark',
                    'pyke-sentinel',
                    'hylobon-enforcer',
                    'cell-block-guard',
                    'tieln-fighter'
                ]);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to search your deck for a bounty upgrade (shuffling deck) and then not play it without the resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bounty-posting'],
                        deck: ['death-mark', 'tieln-fighter', 'top-target', 'cell-block-guard', 'pyke-sentinel', 'hylobon-enforcer'],
                        base: 'chopper-base',
                        resources: 2
                    },
                    player2: {
                        groundArena: ['clone-trooper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bountyPosting);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.deathMark, context.topTarget],
                    invalid: [context.tielnFighter, context.cellBlockGuard, context.pykeSentinel, context.hylobonEnforcer]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.topTarget);

                // P2 is prompted to see the revealed card
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.topTarget]);
                context.player2.clickDone();

                expect(context.topTarget).toBeInZone('hand', context.player1);

                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing if no bounty upgrades are found', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bounty-posting'],
                        deck: ['tieln-fighter', 'cell-block-guard', 'pyke-sentinel', 'hylobon-enforcer'],
                        base: 'chopper-base'
                    },
                    player2: {
                        groundArena: ['clone-trooper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bountyPosting);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.tielnFighter, context.cellBlockGuard, context.pykeSentinel, context.hylobonEnforcer]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                context.player1.clickPrompt('Take nothing');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
