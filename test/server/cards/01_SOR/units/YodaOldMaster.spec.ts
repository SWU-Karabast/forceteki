describe('Yoda, Old Master', function() {
    integration(function(contextRef) {
        describe('Yoda\'s When Defeated ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['yoda#old-master'],
                        hand: ['vanquish'],
                        deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'battlefield-marine']
                    },
                    player2: {
                        groundArena: ['rogue-squadron-skirmisher'],
                        deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'battlefield-marine']
                    }
                });
            });

            it('should draw a card for each selected player', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.rogueSquadronSkirmisher);
                expect(context.yoda).toBeInLocation('discard');
                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'You and Opponent', 'No one']);

                context.player1.clickPrompt('You');
                expect(context.player1.hand.length).toBe(2);
                expect(context.player2.hand.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should draw a card for each selected player', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.rogueSquadronSkirmisher);
                expect(context.yoda).toBeInLocation('discard');
                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'You and Opponent', 'No one']);

                context.player1.clickPrompt('Opponent');
                expect(context.player1.hand.length).toBe(1);
                expect(context.player2.hand.length).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should draw a card for each selected player', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.rogueSquadronSkirmisher);
                expect(context.yoda).toBeInLocation('discard');
                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'You and Opponent', 'No one']);

                context.player1.clickPrompt('You and Opponent');
                expect(context.player1.hand.length).toBe(2);
                expect(context.player2.hand.length).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should draw a card for each selected player', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.rogueSquadronSkirmisher);
                expect(context.yoda).toBeInLocation('discard');
                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'You and Opponent', 'No one']);

                context.player1.clickPrompt('No one');
                expect(context.player1.hand.length).toBe(1);
                expect(context.player2.hand.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});