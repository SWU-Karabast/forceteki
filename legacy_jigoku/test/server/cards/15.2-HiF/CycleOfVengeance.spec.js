describe('Cycle of Vengeance', function() {
    integration(function() {
        describe('Cycle of Vengeance\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['moto-horde', 'shinjo-outrider']
                    },
                    player2: {
                        provinces: ['cycle-of-vengeance'],
                        inPlay: ['togashi-initiate', 'doomed-shugenja'],
                        hand: ['charge', 'assassination', 'fine-katana']
                    }
                });
                this.cycle = this.player2.findCardByName('cycle-of-vengeance');
                this.doomedShugenja = this.player2.findCardByName('doomed-shugenja');
                this.togashiInitiate = this.player2.findCardByName('togashi-initiate');
                this.togashiInitiate.modifyFate(1);
                this.togashiInitiate.honor();
                this.horde = this.player1.findCardByName('moto-horde');
                this.shinjoOutrider = this.player1.findCardByName('shinjo-outrider');
                this.shinjoOutrider.modifyFate(2);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    province: this.cycle,
                    attackers: [this.horde],
                    defenders: []
                });
            });

            it('should allow the ability to be used on any character', function() {
                this.noMoreActions();
                expect(this.player2).toHavePrompt('Triggered Abilities');
                this.player2.clickCard(this.cycle);
                this.player2.clickCard(this.shinjoOutrider);

                expect(this.shinjoOutrider.isHonored).toBe(true);
                expect(this.shinjoOutrider.fate).toBe(3);
                expect(this.getChatLogs(10)).toContain('player2 uses Cycle of Vengeance to honor and place a fate on Shinjo Outrider');

            });

            it('should allow the ability to be used if there is a target outside the conflict, even if they are honored', function() {
                this.noMoreActions();
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.cycle);
                this.player2.clickCard(this.cycle);
                expect(this.player2).toBeAbleToSelect(this.togashiInitiate);
                this.player2.clickCard(this.togashiInitiate);
                expect(this.togashiInitiate.fate).toBe(2);
            });

            it('should allow the ability to be used to place fate on Doomed Shugenja', function() {
                this.noMoreActions();
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.cycle);
                this.player2.clickCard(this.cycle);
                expect(this.player2).toBeAbleToSelect(this.doomedShugenja);
                this.player2.clickCard(this.doomedShugenja);
                expect(this.doomedShugenja.fate).toBe(1);
            });
        });
    });
});
