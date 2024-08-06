describe('Relentless Inquisitor', function() {
    integration(function() {
        describe('For Shame!\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['shinjo-outrider', 'aggressive-moto', 'iuchi-wayfinder', 'kakita-toshimoko', 'doji-challenger']
                    },
                    player2: {
                        inPlay: ['relentless-inquisitor']
                    }
                });
                this.outrider = this.player1.findCardByName('shinjo-outrider');
                this.moto = this.player1.findCardByName('aggressive-moto');
                this.wayfinder = this.player1.findCardByName('iuchi-wayfinder');
                this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                this.challenger = this.player1.findCardByName('doji-challenger');

                this.inquisitor = this.player2.findCardByName('relentless-inquisitor');

                this.outrider.fate = 1;
                this.challenger.fate = 1;
            });

            it('should allow targeting a participating character eligible for the effect', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.outrider, this.moto, this.toshimoko, this.challenger],
                    defenders: [this.inquisitor]
                });

                this.toshimoko.bowed = true;
                this.challenger.bowed = true;

                this.game.checkGameState(true);

                this.player2.clickCard(this.inquisitor);
                expect(this.player2).toBeAbleToSelect(this.outrider);
                expect(this.player2).toBeAbleToSelect(this.moto);
                expect(this.player2).not.toBeAbleToSelect(this.toshimoko); // no fate & bowed
                expect(this.player2).not.toBeAbleToSelect(this.challenger); // fate & bowed
                expect(this.player2).not.toBeAbleToSelect(this.wayfinder); // not participating
                expect(this.player2).not.toBeAbleToSelect(this.inquisitor); // not controlled by opponent
            });

            it('should give you a choice if both effects can impact the target', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.outrider, this.moto],
                    defenders: [this.inquisitor]
                });

                this.player2.clickCard(this.inquisitor);
                this.player2.clickCard(this.outrider);
                expect(this.player1).toHavePromptButton('Remove a fate from this character');
                expect(this.player1).toHavePromptButton('Bow this character');
            });

            it('should remove a fate if selected', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.outrider, this.moto],
                    defenders: [this.inquisitor]
                });

                let fate = this.outrider.fate;
                this.player2.clickCard(this.inquisitor);
                this.player2.clickCard(this.outrider);
                this.player1.clickPrompt('Remove a fate from this character');
                expect(this.outrider.fate).toBe(fate - 1);
                expect(this.outrider.bowed).toBe(false);
                expect(this.getChatLogs(5)).toContain('player2 uses Relentless Inquisitor to remove 1 fate from Shinjo Outrider');
            });

            it('should bow if selected', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.outrider, this.moto],
                    defenders: [this.inquisitor]
                });

                let fate = this.outrider.fate;
                this.player2.clickCard(this.inquisitor);
                this.player2.clickCard(this.outrider);
                this.player1.clickPrompt('Bow this character');
                expect(this.outrider.fate).toBe(fate);
                expect(this.outrider.bowed).toBe(true);
                expect(this.getChatLogs(5)).toContain('player2 uses Relentless Inquisitor to bow Shinjo Outrider');
            });

            it('should not give you a choice if target has no fate', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.outrider, this.moto],
                    defenders: [this.inquisitor]
                });

                this.player2.clickCard(this.inquisitor);
                this.player2.clickCard(this.moto);
                expect(this.player1).not.toHavePromptButton('Remove a fate from this character');
                expect(this.player1).not.toHavePromptButton('Bow this character');
                expect(this.moto.bowed).toBe(true);
                expect(this.getChatLogs(5)).toContain('player2 uses Relentless Inquisitor to bow Aggressive Moto');
            });
        });
    });
});
