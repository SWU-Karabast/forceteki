describe('Ethereal Alignment', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-toshimoko'],
                    hand: ['ethereal-alignment'],
                    provinces: ['manicured-garden', 'city-of-the-rich-frog', 'upholding-authority', 'magistrate-station']
                },
                player2: {
                    inPlay: ['adept-of-the-waves']
                }
            });

            this.player1.player.promptedActionWindows.fate = true;
            this.player2.player.promptedActionWindows.fate = true;

            this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
            this.adept = this.player2.findCardByName('adept-of-the-waves');

            this.alignment = this.player1.findCardByName('ethereal-alignment');
            this.garden = this.player1.findCardByName('manicured-garden');
            this.richFrog = this.player1.findCardByName('city-of-the-rich-frog');
            this.upholding = this.player1.findCardByName('upholding-authority');
            this.station = this.player1.findCardByName('magistrate-station');

            ['province 1', 'province 2', 'province 3', 'province 4'].forEach(province => {
                this.player1.player.getDynastyCardsInProvince(province).forEach(card => card.facedown = true);
                this.player2.player.getDynastyCardsInProvince(province).forEach(card => card.facedown = true);
            });

            this.adept.fate = 10;
            this.toshimoko.fate = 10;
            this.toshimoko.honor();

            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.player2.passConflict();
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.player2.passConflict();
        });

        it('should trigger at the end of the conflict phase', function() {
            this.station.isBroken = true;
            this.player1.claimRing('fire');
            this.noMoreActions();
            this.player1.clickPrompt('military');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.alignment);
        });

        it('should not trigger if there are no broken provinces', function() {
            this.player1.claimRing('air');
            this.player1.claimRing('earth');
            this.player1.claimRing('fire');
            this.player1.claimRing('void');
            this.player1.claimRing('water');

            this.noMoreActions();
            this.player1.clickPrompt('military');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should prompt you to choose a valid province - test 1', function() {
            this.station.isBroken = true;
            this.garden.isBroken = true;
            this.upholding.isBroken = true;
            this.richFrog.isBroken = true;
            this.player1.claimRing('fire');
            this.noMoreActions();
            this.player1.clickPrompt('military');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.alignment);
            this.player1.clickCard(this.alignment);
            expect(this.player1).toBeAbleToSelect(this.station);
            expect(this.player1).not.toBeAbleToSelect(this.garden);
            expect(this.player1).not.toBeAbleToSelect(this.upholding);
            expect(this.player1).not.toBeAbleToSelect(this.richFrog);
        });

        it('should prompt you to choose a valid province - test 2', function() {
            this.station.isBroken = true;
            this.garden.isBroken = true;
            this.upholding.isBroken = true;
            this.richFrog.isBroken = true;
            this.player1.claimRing('earth');
            this.noMoreActions();
            this.player1.clickPrompt('military');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.alignment);
            this.player1.clickCard(this.alignment);
            expect(this.player1).not.toBeAbleToSelect(this.station);
            expect(this.player1).not.toBeAbleToSelect(this.garden);
            expect(this.player1).toBeAbleToSelect(this.upholding);
            expect(this.player1).toBeAbleToSelect(this.richFrog);
        });

        it('should prompt you to choose a valid province - test 3', function() {
            this.station.isBroken = true;
            this.garden.isBroken = true;
            this.upholding.isBroken = true;
            this.richFrog.isBroken = true;
            this.player1.claimRing('air');
            this.player1.claimRing('earth');
            this.player1.claimRing('fire');
            this.player1.claimRing('void');
            this.player1.claimRing('water');
            this.noMoreActions();
            this.player1.clickPrompt('military');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.alignment);
            this.player1.clickCard(this.alignment);
            expect(this.player1).toBeAbleToSelect(this.station);
            expect(this.player1).toBeAbleToSelect(this.garden);
            expect(this.player1).toBeAbleToSelect(this.upholding);
            expect(this.player1).toBeAbleToSelect(this.richFrog);
        });

        it('should not prompt if the rings and provinces don\'t align', function() {
            this.station.isBroken = true;
            this.garden.isBroken = true;
            this.upholding.isBroken = true;
            this.richFrog.isBroken = true;
            this.player1.claimRing('water');
            this.noMoreActions();
            this.player1.clickPrompt('military');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should unbreak the province', function() {
            this.toshimoko.bowed = true;
            this.game.checkGameState(true);
            this.station.isBroken = true;
            this.player1.claimRing('fire');
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.station);
            expect(this.player1).toHavePrompt('Action Window');

            this.noMoreActions();
            this.player2.clickPrompt('military');
            this.player1.clickCard(this.alignment);
            expect(this.station.isBroken).toBe(true);
            this.player1.clickCard(this.station);
            expect(this.getChatLogs(10)).toContain('player1 plays Ethereal Alignment to restore Magistrate Station');
            expect(this.station.isBroken).toBe(false);
            expect(this.station.facedown).toBe(false);
            expect(this.toshimoko.isHonored).toBe(true);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.station);
            expect(this.player1).toHavePrompt('Magistrate Station');
            expect(this.toshimoko.bowed).toBe(true);
            this.player1.clickCard(this.toshimoko);
            expect(this.toshimoko.bowed).toBe(false);
        });

        it('should remove itself from the game', function() {
            this.toshimoko.bowed = true;
            this.game.checkGameState(true);
            this.station.isBroken = true;
            this.player1.claimRing('fire');
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.station);
            expect(this.player1).toHavePrompt('Action Window');

            this.noMoreActions();
            this.player2.clickPrompt('military');
            this.player1.clickCard(this.alignment);
            expect(this.station.isBroken).toBe(true);
            this.player1.clickCard(this.station);
            expect(this.getChatLogs(10)).toContain('player1 plays Ethereal Alignment to restore Magistrate Station');
            expect(this.alignment.location).toBe('removed from game');
        });
    });
});
