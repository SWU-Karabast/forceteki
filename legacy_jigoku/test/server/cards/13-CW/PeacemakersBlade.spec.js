describe('Peacemaker\'s Blade', function() {
    integration(function() {
        describe('Peacemaker\'s Blade\'s persistent ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['togashi-kazue', 'seppun-guardsman'],
                        dynastyDeck: ['favorable-ground']
                    },
                    player2: {
                        inPlay: ['solemn-scholar'],
                        provinces: ['fertile-fields'],
                        hand: ['peacemaker-s-blade', 'captive-audience']
                    }
                });
                this.togashiKazue = this.player1.findCardByName('togashi-kazue');
                this.fertileFields = this.player2.findCardByName('fertile-fields');
                this.guardsman = this.player1.findCardByName('seppun-guardsman');
                this.peacemaker = this.player2.findCardByName('peacemaker-s-blade');
                this.favorableGround = this.player1.placeCardInProvince('favorable-ground');
                this.scholar = this.player2.findCardByName('solemn-scholar');
                this.player1.pass();
            });

            it('should not be able to declare the attached character as an attacker', function() {
                this.player2.playAttachment(this.peacemaker, this.togashiKazue);
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Initiate Conflict');
                this.player1.clickRing('air');
                expect(this.game.currentConflict.conflictType).toBe('military');
                this.player1.clickCard(this.togashiKazue);
                expect(this.togashiKazue.inConflict).toBe(false);
                expect(this.game.currentConflict.attackers).not.toContain(this.togashiKazue);
            });

            it('should let the character be declared as a defender', function() {
                this.player2.playAttachment(this.peacemaker, this.scholar);
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Initiate Conflict');
                this.player1.clickRing('air');
                expect(this.game.currentConflict.conflictType).toBe('military');
                this.player1.clickCard(this.togashiKazue);
                this.player1.clickCard(this.fertileFields);
                this.player1.clickPrompt('Initiate Conflict');
                this.player2.clickCard(this.scholar);
                expect(this.scholar.inConflict).toBe(true);
                expect(this.scholar.isDefending()).toBe(true);
            });

            it('should let the character move in', function() {
                this.player2.playAttachment(this.peacemaker, this.togashiKazue);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.guardsman],
                    defenders: []
                });
                this.player2.pass();
                this.player1.clickCard(this.favorableGround);
                expect(this.player1).toBeAbleToSelect(this.togashiKazue);
                this.player1.clickCard(this.togashiKazue);
                expect(this.togashiKazue.inConflict).toBe(true);
            });

            it('should not let you attach to an attacker', function() {
                this.player2.pass();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.guardsman],
                    defenders: []
                });
                this.player2.clickCard(this.peacemaker);
                expect(this.player2).not.toBeAbleToSelect(this.guardsman);
                expect(this.player2).toHavePrompt('Peacemaker\'s Blade');
            });
        });
    });
});
