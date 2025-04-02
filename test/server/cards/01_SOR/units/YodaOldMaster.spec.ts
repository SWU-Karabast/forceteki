describe('Yoda, Old Master', function() {
    integration(function(contextRef) {
        describe('Yoda\'s When Defeated ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['yoda#old-master'],
                        hand: ['vanquish']
                    },
                    player2: {
                        groundArena: ['rogue-squadron-skirmisher']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should draw a card for each selected player', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.rogueSquadronSkirmisher);
                expect(context.yoda).toBeInZone('discard');
                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'Done']);

                context.player1.clickPrompt('You');
                context.player1.clickPrompt('Done');
                expect(context.player1.hand.length).toBe(2);
                expect(context.player2.hand.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should draw a card for each selected player', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.rogueSquadronSkirmisher);
                expect(context.yoda).toBeInZone('discard');
                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'Done']);

                context.player1.clickPrompt('Opponent');
                context.player1.clickPrompt('Done');
                expect(context.player1.hand.length).toBe(1);
                expect(context.player2.hand.length).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should draw a card for each selected player', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.rogueSquadronSkirmisher);
                expect(context.yoda).toBeInZone('discard');
                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'Done']);

                context.player1.clickPrompt('You');
                context.player1.clickPrompt('Opponent');
                context.player1.clickPrompt('Done');
                expect(context.player1.hand.length).toBe(2);
                expect(context.player2.hand.length).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should draw a card for each selected player', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.rogueSquadronSkirmisher);
                expect(context.yoda).toBeInZone('discard');
                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'Done']);

                context.player1.clickPrompt('Done');
                expect(context.player1.hand.length).toBe(1);
                expect(context.player2.hand.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should work with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['yoda#old-master']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.yoda);
            expect(context.yoda).toBeInZone('discard');
            expect(context.player2).toHaveEnabledPromptButtons(['You', 'Opponent', 'Done']);

            context.player2.clickPrompt('You');
            context.player2.clickPrompt('Done');
            expect(context.player2.hand.length).toBe(1);
            expect(context.player1.hand.length).toBe(0);
            expect(context.player1).toBeActivePlayer();

            context.player1.passAction();
        });
    });
});