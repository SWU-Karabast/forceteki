describe('Ramshackle Facade', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-hotaru', 'togashi-initiate', 'doji-challenger', 'doji-whisperer'],
                    hand: ['ramshackle-facade'],
                    dynastyDiscard: ['northern-curtain-wall', 'seventh-tower', 'funeral-pyre']
                },
                player2: {
                    inPlay: ['brash-samurai']
                }
            });

            this.hotaru = this.player1.findCardByName('doji-hotaru');
            this.initiate = this.player1.findCardByName('togashi-initiate');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.brash = this.player2.findCardByName('brash-samurai');
            this.pyre = this.player1.findCardByName('funeral-pyre');
            this.wall = this.player1.findCardByName('northern-curtain-wall');
            this.tower = this.player1.findCardByName('seventh-tower');

            this.facade = this.player1.findCardByName('ramshackle-facade');

            this.player1.placeCardInProvince(this.tower, 'province 1');
            this.player1.placeCardInProvince(this.pyre, 'province 2');
            this.player1.placeCardInProvince(this.wall, 'province 3');
            this.tower.facedown = false;
            this.pyre.facedown = false;
            this.wall.facedown = false;
        });

        it('should sac a holding and prompt you to select an attacking character with printed cost <= 3', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.hotaru, this.challenger],
                defenders: [this.brash]
            });
            this.player2.pass();
            this.player1.clickCard(this.facade);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.initiate);
            expect(this.player1).not.toBeAbleToSelect(this.hotaru);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.brash);

            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.tower);
            expect(this.challenger.bowed).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Ramshackle Façade, sacrificing Seventh Tower to bow Doji Challenger');
        });
    });
});
