describe('Bounty Posting', function() {
    integration(function(contextRef) {
        describe('Bounty Posting\'s ability', function() {
            it('should be able to search your deck for a bounty upgrade (shuffling deck) and then play it for its cost', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['bounty-posting'],
                        deck: ['death-mark', 'tieln-fighter', 'top-target', 'cell-block-guard', 'pyke-sentinel', 'hylobon-enforcer']
                    },
                    player2: {
                        groundArena: ['clone-trooper']
                    }
                });

                const { context } = contextRef;

                const preShuffleDeck = context.player1.deck;

                context.player1.clickCard(context.bountyPosting);
                expect(context.player1).toHaveEnabledPromptButtons([context.deathMark, context.topTarget, 'Take nothing']);

                context.player1.clickPrompt(context.topTarget.title);
                expect(context.topTarget).toBeInZone('hand', context.player1);
                expect(context.player1).toHavePassAbilityPrompt('You may play that upgrade (paying its cost).');

                context.player1.clickPrompt('You may play that upgrade (paying its cost).');
                context.player1.clickCard(context.cloneTrooper);
                expect(context.cloneTrooper).toHaveExactUpgradeNames(['top-target']);
                expect(preShuffleDeck).not.toEqual(context.player1.deck);
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing if no bounty upgrades are found', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['bounty-posting'],
                        deck: ['tieln-fighter', 'cell-block-guard', 'pyke-sentinel', 'hylobon-enforcer']
                    },
                    player2: {
                        groundArena: ['clone-trooper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bountyPosting);
                expect(context.player1).toHaveEnabledPromptButtons(['Take nothing']);

                context.player1.clickPrompt('Take nothing');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
