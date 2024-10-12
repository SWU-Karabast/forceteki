describe('Mission Briefing', function() {
    integration(function() {
        describe('Mission Briefing\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
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
                this.player1.clickCard(this.missionBriefing);
                expect(this.player1).toHaveEnabledPromptButtons(['You', 'Opponent']);
                this.player1.clickPrompt('You');
                expect(this.player1.hand.length).toBe(2);
                expect(this.player1.deck.length).toBe(1);
                expect(this.player2.hand.length).toBe(0);
                expect(this.player2.deck.length).toBe(2);
            });

            it('should have the chosen player draw 2 cards', function () {
                this.player1.clickCard(this.missionBriefing);
                expect(this.player1).toHaveEnabledPromptButtons(['You', 'Opponent']);
                this.player1.clickPrompt('Opponent');
                expect(this.player1.hand.length).toBe(0);
                expect(this.player1.deck.length).toBe(3);
                expect(this.player2.hand.length).toBe(2);
                expect(this.player2.deck.length).toBe(0);
            });
        });
    });
});
