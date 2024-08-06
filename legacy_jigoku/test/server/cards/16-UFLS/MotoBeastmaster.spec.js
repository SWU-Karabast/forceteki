describe('Moto Beastmaster', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['moto-beastmaster'],
                    dynastyDiscard: ['moto-chagatai', 'border-rider', 'kakita-toshimoko', 'favorable-ground']
                },
                player2: {
                    inPlay: ['moto-beastmaster'],
                    dynastyDiscard: ['moto-chagatai', 'border-rider', 'kakita-toshimoko', 'favorable-ground']
                }
            });

            this.beastmaster = this.player1.findCardByName('moto-beastmaster');
            this.chagatai = this.player1.findCardByName('moto-chagatai');
            this.rider = this.player1.findCardByName('border-rider');
            this.tosh = this.player1.findCardByName('kakita-toshimoko');
            this.ground = this.player1.findCardByName('favorable-ground');

            this.player1.placeCardInProvince(this.chagatai, 'province 1');
            this.player1.placeCardInProvince(this.rider, 'province 2');
            this.player1.placeCardInProvince(this.tosh, 'province 3');
            this.player1.placeCardInProvince(this.ground, 'province 4');

            this.beastmaster2 = this.player2.findCardByName('moto-beastmaster');
            this.chagatai2 = this.player2.findCardByName('moto-chagatai');
            this.rider2 = this.player2.findCardByName('border-rider');
            this.tosh2 = this.player2.findCardByName('kakita-toshimoko');
            this.ground2 = this.player2.findCardByName('favorable-ground');

            this.player2.placeCardInProvince(this.chagatai2, 'province 1');
            this.player2.placeCardInProvince(this.rider2, 'province 2');
            this.player2.placeCardInProvince(this.tosh2, 'province 3');
            this.player2.placeCardInProvince(this.ground2, 'province 4');
        });

        it('should react when assigned as an attacker', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.beastmaster]
            });
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.beastmaster);
        });

        it('should let you pick a character that costs 4 or less to put into play in the conflict when first player', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.beastmaster]
            });
            this.player1.clickCard(this.beastmaster);
            expect(this.player1).not.toBeAbleToSelect(this.chagatai);
            expect(this.player1).toBeAbleToSelect(this.rider);
            expect(this.player1).toBeAbleToSelect(this.tosh);
            expect(this.player1).not.toBeAbleToSelect(this.ground);
            this.player1.clickCard(this.tosh);

            expect(this.getChatLogs(5)).toContain('player1 uses Moto Beastmaster to put Kakita Toshimoko into play in the conflict');
            expect(this.tosh.isParticipating()).toBe(true);
            this.player2.clickCard(this.beastmaster2);
            this.player2.clickPrompt('Done');
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should let you pick a character that costs 2 or less to put into play in the conflict when second player', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.beastmaster2]
            });
            this.player2.clickCard(this.beastmaster2);
            expect(this.player2).not.toBeAbleToSelect(this.chagatai2);
            expect(this.player2).toBeAbleToSelect(this.rider2);
            expect(this.player2).not.toBeAbleToSelect(this.tosh2);
            expect(this.player2).not.toBeAbleToSelect(this.ground2);
            this.player2.clickCard(this.rider2);

            expect(this.getChatLogs(5)).toContain('player2 uses Moto Beastmaster to put Border Rider into play in the conflict');
            expect(this.rider2.isParticipating()).toBe(true);
        });
    });
});
