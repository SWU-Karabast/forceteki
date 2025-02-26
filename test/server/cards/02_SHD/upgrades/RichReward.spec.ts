describe('Rich Reward', function() {
    integration(function(contextRef) {
        describe('Rich Reward\'s Bounty ability', function() {
            it('should give Experience token up to two units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['rich-reward'] }, 'atst', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['concord-dawn-interceptors']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst, context.yoda, context.concordDawnInterceptors]);
                expect(context.player2).toHavePassAbilityButton();
                expect(context.player2).toHavePrompt('Select 2 cards');

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.concordDawnInterceptors);
                context.player2.clickCardNonChecking(context.atst);
                context.player2.clickPrompt('Done');

                expect(context.wampa).toHaveExactUpgradeNames(['experience']);
                expect(context.concordDawnInterceptors).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give Experience token to one unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['rich-reward'] }, 'atst', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst, context.yoda, context.concordDawnInterceptors]);
                expect(context.player2).toHavePassAbilityButton();
                expect(context.player2).toHavePrompt('Select 2 cards');

                context.player2.clickCard(context.yoda);
                context.player2.clickPrompt('Done');

                expect(context.yoda).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should automatically pass if there is no other units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: [{ card: 'phaseiii-dark-trooper', upgrades: ['rich-reward'] }]
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);

                // bounty trigger still appears even though there's no effect, b/c the player still needs to decide whether to "collect the bounty"
                // Dark Trooper ability happens in same window
                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
                context.player1.clickPrompt('You');
                expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Give an Experience token to each of up to 2 units');
                context.player1.clickPrompt('Collect Bounty: Give an Experience token to each of up to 2 units');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
