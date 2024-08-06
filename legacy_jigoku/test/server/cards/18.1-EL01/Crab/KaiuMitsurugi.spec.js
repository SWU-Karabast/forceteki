describe('Kaiu Mitsurugi', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kaiu-mitsurugi', 'daidoji-nerishma'],
                    dynastyDiscard: ['northern-curtain-wall', 'seventh-tower', 'doji-challenger']
                },
                player2: {
                    inPlay: []
                }
            });

            this.mitsurugi = this.player1.findCardByName('kaiu-mitsurugi');
            this.nerishma = this.player1.findCardByName('daidoji-nerishma');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.wall = this.player1.findCardByName('northern-curtain-wall');
            this.tower = this.player1.findCardByName('seventh-tower');
            this.player1.placeCardInProvince(this.tower, 'province 1');
            this.tower.facedown = true;
            this.player1.placeCardInProvince(this.wall, 'province 2');
            this.wall.facedown = true;
            this.player1.placeCardInProvince(this.challenger, 'province 3');
            this.challenger.facedown = true;
        });

        it('should give holdings Rally', function() {
            expect(this.tower.hasKeyword('rally')).toBe(true);
            this.player1.clickCard(this.nerishma);
            this.player1.clickCard(this.tower);
            expect(this.getChatLogs(5)).toContain('player1 places Adept of the Waves faceup in province 1 due to Seventh Tower\'s Rally');
            expect(this.tower.hasKeyword('rally')).toBe(true);
        });

        it('should let you sacrifice a holding to gain an fate and draw a card', function() {
            let fate = this.player1.fate;
            let hand = this.player1.hand.length;
            this.tower.facedown = false;
            this.challenger.facedown = false;
            this.game.checkGameState(true);

            this.player1.clickCard(this.mitsurugi);
            expect(this.player1).toBeAbleToSelect(this.tower);
            expect(this.player1).not.toBeAbleToSelect(this.wall);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);

            this.player1.clickCard(this.tower);
            expect(this.player1.fate).toBe(fate + 1);
            expect(this.player1.hand.length).toBe(hand + 1);

            expect(this.getChatLogs(5)).toContain('player1 uses Kaiu Mitsurugi, sacrificing Seventh Tower to gain 1 fate and draw 1 card');
        });
    });
});
