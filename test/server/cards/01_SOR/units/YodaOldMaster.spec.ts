describe('Yoda, Old Master', function() {
    integration(function(contextRef) {
        describe('Yoda\'s When Defeated ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['yoda#old-master'],
                        hand: ['vanquish']
                    },
                    player2: {
                        groundArena: ['rogue-squadron-skirmisher']
                    }
                });
            });

            it('should draw a card for each selected player', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.rogueSquadronSkirmisher);
                expect(context.yoda).toBeInLocation('discard');
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
                expect(context.yoda).toBeInLocation('discard');
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
                expect(context.yoda).toBeInLocation('discard');
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
                expect(context.yoda).toBeInLocation('discard');
                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'Done']);

                context.player1.clickPrompt('Done');
                expect(context.player1.hand.length).toBe(1);
                expect(context.player2.hand.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});