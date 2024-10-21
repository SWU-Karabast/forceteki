describe('Mission Briefing', function() {
    integration(function(contextRef) {
        describe('Mission Briefing\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['mission-briefing'],
                        deck: ['atst', 'wampa', 'cartel-spacer']
                    },
                    player2: {
                        deck: ['superlaser-blast', 'cargo-juggernaut']
                    }
                });
            });

            it('should have the chosen player draw 2 cards', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.missionBriefing);
                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent']);
                context.player1.clickPrompt('You');
                expect(context.player1.hand.length).toBe(2);
                expect(context.player1.deck.length).toBe(1);
                expect(context.player2.hand.length).toBe(0);
                expect(context.player2.deck.length).toBe(2);
            });

            it('should have the chosen player draw 2 cards', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.missionBriefing);
                expect(context.player1).toHaveEnabledPromptButtons(['You', 'Opponent']);
                context.player1.clickPrompt('Opponent');
                expect(context.player1.hand.length).toBe(0);
                expect(context.player1.deck.length).toBe(3);
                expect(context.player2.hand.length).toBe(2);
                expect(context.player2.deck.length).toBe(0);
            });
        });
    });
});
