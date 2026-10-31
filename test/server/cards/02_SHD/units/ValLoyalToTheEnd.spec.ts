describe('Val, Loyal To The End', function() {
    integration(function(contextRef) {
        describe('Val, Loyal To The End\'s Bounty ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['val#loyal-to-the-end', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['wampa']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give 2 experience tokens and deal 3 damage', function () {
                const { context } = contextRef;

                // val kill herself to wampa
                context.player1.clickCard(context.val);
                context.player1.clickCard(context.wampa);

                // 2 triggers to resolve
                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
                context.player1.clickPrompt('You');

                // give 2 experiences to battlefield marine
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience', 'experience']);

                // player 2 should be able to deal 3 damage to a unit
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.wampa]);
                expect(context.player2).toHavePassAbilityButton();

                // deal 3 damages to battlefield marine
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it(', opponent is current player, he should choose which triggers to activate first', function () {
                const { context } = contextRef;

                context.player1.passAction();

                // wampa kill val
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.val);

                expect(context.player2).toHaveExactPromptButtons(['You', 'Opponent']);
                context.player2.clickPrompt('You');

                // deal 3 damages to a unit
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.wampa]);
                expect(context.player2).toHavePassAbilityButton();

                // kill battlefield marine
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.zoneName).toBe('discard');

                // green squadron awing is automatically choose
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player1).toBeActivePlayer();
            });
        });

        it('Val\'s When Defeated ability should give Experience tokens to a unit friendly to the player who controlled her and her Bounty should be collected by the other player when defeated by No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['val#loyal-to-the-end', 'battlefield-marine']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.val);

            // player2 is the active player and chooses the order of the triggers
            expect(context.player2).toHaveExactPromptButtons(['You', 'Opponent']);
            context.player2.clickPrompt('You');

            // When Defeated: player2 controlled Val, so player2's units are friendly
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);
            context.player2.clickCard(context.wampa);
            expect(context.wampa).toHaveExactUpgradeNames(['experience', 'experience']);

            // Bounty: collected by player1, the opponent of Val's controller
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.greenSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.greenSquadronAwing).toBeInZone('discard', context.player2);
            expect(context.battlefieldMarine.isUpgraded()).toBeFalse();
            expect(context.val).toBeInZone('discard', context.player1);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
