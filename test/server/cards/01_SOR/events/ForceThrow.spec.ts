describe('Force Throw', function() {
    integration(function(contextRef) {
        describe('Force Throw\'s ability', function() {
            it('should select opponent to discard a card and deal damage to a unit equals to its cost', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['force-throw'],
                        groundArena: ['wampa', 'ezra-bridger#resourceful-troublemaker']
                    },
                    player2: {
                        hand: ['karabast', 'battlefield-marine'],
                        groundArena: ['specforce-soldier', 'atst'],
                        spaceArena: ['tieln-fighter']
                    },
                });

                const { context } = contextRef;

                // Damage dealt by opponent discarded card
                context.player1.clickCard(context.forceThrow);
                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);

                // Opponent discards a card
                context.player1.clickPrompt('Opponent');
                context.player2.clickCard(context.karabast);

                // Validate board state and options
                expect(context.karabast).toBeInZone('discard');

                // Apply damage
                expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter, context.specforceSoldier, context.atst, context.wampa, context.ezraBridger]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.atst);

                // Assertions
                expect(context.atst.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should select opponent to discard a card but no deal damage as there is not a force unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['force-throw'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        hand: ['karabast', 'battlefield-marine'],
                        groundArena: ['specforce-soldier', 'atst', 'ezra-bridger#resourceful-troublemaker']
                    },
                });

                const { context } = contextRef;

                // Opponent discards a card no force unit in play
                context.player1.clickCard(context.forceThrow);
                context.player1.clickPrompt('Opponent');
                context.player2.clickCard(context.karabast);

                expect(context.karabast).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should select myself to discard a card but no cards to discard', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['force-throw'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        hand: ['karabast', 'battlefield-marine'],
                        groundArena: ['specforce-soldier', 'atst', 'ezra-bridger#resourceful-troublemaker']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.forceThrow);
                context.player1.clickPrompt('You');

                expect(context.player2).toBeActivePlayer();
            });

            it('should select myself to discard a card and deal damage to an enemy unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['force-throw', 'strike-true'],
                        groundArena: ['wampa', 'ezra-bridger#resourceful-troublemaker']
                    },
                    player2: {
                        groundArena: ['atst']
                    },
                });

                const { context } = contextRef;

                // Discard a card and no force unit in play
                context.player1.clickCard(context.forceThrow);
                context.player1.clickPrompt('You');

                context.player1.clickCard(context.strikeTrue);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.ezraBridger, context.atst]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.atst);

                expect(context.strikeTrue).toBeInZone('discard');
                expect(context.atst.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
