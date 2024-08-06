describe('Command By Name', function() {
    integration(function() {
        describe('Command By Name\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['adept-of-the-waves'],
                        hand: ['command-by-name', 'fine-katana', 'ornate-fan']
                    },
                    player2: {
                        inPlay: [],
                        provinces: ['pilgrimage'],
                        dynastyDiscard: ['favorable-ground']
                    }
                });

                this.adept = this.player1.findCardByName('adept-of-the-waves');
                this.command = this.player1.findCardByName('command-by-name');
                this.katana = this .player1.findCardByName('fine-katana');
                this.fan = this.player1.findCardByName('ornate-fan');

                this.pilgrimage = this.player2.findCardByName('pilgrimage');
                this.favorableGround = this.player2.findCardByName('favorable-ground');
            });

            it('should set the province strength to 1', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    province: this.pilgrimage,
                    attackers: [this.adept],
                    defenders: []
                });
                this.player2.pass();
                let honor = this.player1.honor;

                this.player1.clickCard(this.command);
                expect(this.player1).toHavePrompt('Select card to discard');
                expect(this.player1).toBeAbleToSelect(this.katana);
                expect(this.player1).toBeAbleToSelect(this.fan);
                this.player1.clickCard(this.katana);
                expect(this.player1.honor).toBe(honor - 1);
                expect(this.katana.location).toBe('conflict discard pile');
                expect(this.pilgrimage.getStrength()).toBe(0);
                expect(this.getChatLogs(5)).toContain('player1 plays Command By Name, losing 1 honor and discarding Fine Katana to reduce the strength of an attacked province to 0');
                expect(this.getChatLogs(5)).toContain('player1 reduces the strength of Pilgrimage to 0');
            });

            it('should set base not total', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    province: this.pilgrimage,
                    attackers: [this.adept],
                    defenders: []
                });
                this.player2.pass();
                this.player2.moveCard(this.favorableGround, this.pilgrimage.location);
                this.player1.clickCard(this.command);
                this.player1.clickCard(this.katana);
                expect(this.pilgrimage.getStrength()).toBe(1);
            });
        });
    });
});
