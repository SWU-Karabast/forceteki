describe('Bounty Posting', function() {
    integration(function(contextRef) {
        describe('Bounty Posting\'s ability', function() {
            it('should be able to search your deck for a bounty upgrade (shuffling deck) and then play it for its cost', function () {
                contextRef.setupTest({
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

                const preShuffleDeck = context.player1.deck;

                context.player1.clickCard(context.bountyPosting);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.deathMark, context.topTarget],
                    unselectable: [context.tielnFighter, context.cellBlockGuard, context.pykeSentinel, context.hylobonEnforcer]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.topTarget);
                expect(context.topTarget).toBeInZone('hand', context.player1);
                expect(context.player1).toHavePassAbilityPrompt('Play that upgrade (paying its cost).');

                expect(context.getChatLogs(4)).toEqual([
                    'player1 plays Bounty Posting to search their deck',
                    'player1 takes Top Target',
                    'player1 puts 5 cards on the bottom of their deck',
                    'player1 is shuffling their deck'
                ]);

                context.player1.clickPrompt('Play that upgrade (paying its cost).');
                context.player1.clickCard(context.cloneTrooper);
                expect(context.cloneTrooper).toHaveExactUpgradeNames(['top-target']);
                expect(preShuffleDeck).not.toEqual(context.player1.deck);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to search your deck for a bounty upgrade (shuffling deck) and then not play it without the resources', function () {
                contextRef.setupTest({
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
                    unselectable: [context.tielnFighter, context.cellBlockGuard, context.pykeSentinel, context.hylobonEnforcer]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.topTarget);
                expect(context.topTarget).toBeInZone('hand', context.player1);

                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing if no bounty upgrades are found', function () {
                contextRef.setupTest({
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
                    unselectable: [context.tielnFighter, context.cellBlockGuard, context.pykeSentinel, context.hylobonEnforcer]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickPrompt('Take nothing');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
