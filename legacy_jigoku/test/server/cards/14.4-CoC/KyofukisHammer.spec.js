describe('Kyofuki\'s Hammer', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-whisperer'],
                    hand: ['kyofuki-s-hammer']
                },
                player2: {
                    inPlay: ['togashi-yokuni'],
                    dynastyDiscard: ['favorable-ground', 'imperial-storehouse', 'a-season-of-war', 'mirumoto-raitsugu']
                }
            });
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.togashiYokuni = this.player2.findCardByName('togashi-yokuni');
            this.hammer = this.player1.findCardByName('kyofuki-s-hammer');

            this.p1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.ground = this.player2.placeCardInProvince('favorable-ground', 'province 1');
            this.storehouse = this.player2.placeCardInProvince('imperial-storehouse', 'province 2');
            this.season = this.player2.placeCardInProvince('a-season-of-war', 'province 3');
            this.raitsugu = this.player2.placeCardInProvince('mirumoto-raitsugu', 'province 4');

            this.player1.playAttachment(this.hammer, this.whisperer);

            this.season.facedown = true;
            this.noMoreActions();
        });

        it('should trigger when attached character wins the conflict', function() {
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: []
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.hammer);
        });

        it('should not trigger when attached character loses the conflict', function() {
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: [this.togashiYokuni]
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should allow targeting a card in a province', function() {
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: []
            });
            this.noMoreActions();
            this.player1.clickCard(this.hammer);

            expect(this.player1).toBeAbleToSelect(this.ground);
            expect(this.player1).toBeAbleToSelect(this.storehouse);
            expect(this.player1).toBeAbleToSelect(this.season);
            expect(this.player1).toBeAbleToSelect(this.raitsugu);
            expect(this.player1).not.toBeAbleToSelect(this.togashiYokuni);
        });

        it('should discard the card', function() {
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: []
            });
            this.noMoreActions();
            expect(this.raitsugu.location).toBe('province 4');
            this.player1.clickCard(this.hammer);
            this.player1.clickCard(this.raitsugu);
            expect(this.raitsugu.location).toBe('dynasty discard pile');
        });

        it('discarding the card shouldn\'t influence breaking', function() {
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: [],
                type: 'political',
                province: this.p1
            });
            this.noMoreActions();
            expect(this.ground.location).toBe('province 1');
            this.player1.clickCard(this.hammer);
            this.player1.clickCard(this.ground);
            expect(this.ground.location).toBe('dynasty discard pile');
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.p1.isBroken).toBe(false);
        });
    });
});
