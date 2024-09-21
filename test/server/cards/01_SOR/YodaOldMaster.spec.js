describe('Yoda, Old Master', function() {
    integration(function() {
        describe('Yoda\'s When Defeated ability', function() {
            beforeEach(function () {
                this.setupTest({
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
                this.player1.clickCard(this.yoda);
                this.player1.clickCard(this.rogueSquadronSkirmisher);
                expect(this.yoda).toBeInLocation('discard');
                expect(this.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'You and Opponent', 'No one']);

                this.player1.clickPrompt('You');
                expect(this.player1.hand.length).toBe(2);
                expect(this.player2.hand.length).toBe(0);
                expect(this.player2).toBeActivePlayer();
            });

            it('should draw a card for each selected player', function () {
                this.player1.clickCard(this.yoda);
                this.player1.clickCard(this.rogueSquadronSkirmisher);
                expect(this.yoda).toBeInLocation('discard');
                expect(this.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'You and Opponent', 'No one']);

                this.player1.clickPrompt('Opponent');
                expect(this.player1.hand.length).toBe(1);
                expect(this.player2.hand.length).toBe(1);
                expect(this.player2).toBeActivePlayer();
            });

            it('should draw a card for each selected player', function () {
                this.player1.clickCard(this.yoda);
                this.player1.clickCard(this.rogueSquadronSkirmisher);
                expect(this.yoda).toBeInLocation('discard');
                expect(this.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'You and Opponent', 'No one']);

                this.player1.clickPrompt('You and Opponent');
                expect(this.player1.hand.length).toBe(2);
                expect(this.player2.hand.length).toBe(1);
                expect(this.player2).toBeActivePlayer();
            });

            it('should draw a card for each selected player', function () {
                this.player1.clickCard(this.yoda);
                this.player1.clickCard(this.rogueSquadronSkirmisher);
                expect(this.yoda).toBeInLocation('discard');
                expect(this.player1).toHaveEnabledPromptButtons(['You', 'Opponent', 'You and Opponent', 'No one']);

                this.player1.clickPrompt('No one');
                expect(this.player1.hand.length).toBe(1);
                expect(this.player2.hand.length).toBe(0);
                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});