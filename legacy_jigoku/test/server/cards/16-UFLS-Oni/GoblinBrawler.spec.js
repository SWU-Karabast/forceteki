describe('Goblin Brawler', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 12,
                    inPlay: ['goblin-brawler'],
                    hand: ['forebearer-s-echoes'],
                    dynastyDiscard: ['goblin-brawler']
                },
                player2: {
                    honor: 10,
                    inPlay: ['kakita-yoshi'],
                    hand: ['assassination']
                }
            });

            this.brawler1 = this.player1.findCardByName('goblin-brawler', 'play area');
            this.brawler2 = this.player1.findCardByName('goblin-brawler', 'dynasty discard pile');
            this.echoes = this.player1.findCardByName('forebearer-s-echoes');
            this.kakitaYoshi = this.player2.findCardByName('kakita-yoshi');
            this.assassination = this.player2.findCardByName('assassination');

            this.kakitaYoshi.honor();
        });

        it('should be removed from game when it leaves play (mid conflict)', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.brawler1],
                defenders: [this.kakitaYoshi],
                type: 'military'
            });

            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.brawler1);

            expect(this.brawler1.location).toBe('removed from game');
            expect(this.getChatLogs(5)).toContain('Goblin Brawler is removed from the game due to being a Shadowlands character');

            this.player1.clickCard(this.echoes);
            this.player1.clickCard(this.brawler2);
            expect(this.brawler2.location).toBe('play area');
            this.noMoreActions();

            expect(this.brawler2.location).toBe('removed from game');
            expect(this.getChatLogs(2)).toContain('Goblin Brawler is removed from the game due to being a Shadowlands character');
        });

        it('should be removed from game when it leaves play (end of phase)', function() {
            this.advancePhases('fate');
            this.player1.clickPrompt('Done');
            expect(this.brawler1.location).toBe('removed from game');
            expect(this.getChatLogs(5)).toContain('Goblin Brawler is removed from the game due to being a Shadowlands character');
        });
    });
});
