describe('Palm Strike', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-ichi', 'doomed-shugenja', 'shrine-maiden'],
                    hand: ['palm-strike', 'ancestral-daisho'],
                    dynastyDiscard: []
                },
                player2: {
                    inPlay: ['brash-samurai'],
                    hand: ['kakita-blade', 'elegant-tessen']
                }
            });

            this.togashiIchi = this.player1.findCardByName('togashi-ichi');
            this.doomedShugenja = this.player1.findCardByName('doomed-shugenja');
            this.shrineMaiden = this.player1.findCardByName('shrine-maiden');
            this.palmStrike = this.player1.findCardByName('palm-strike');
            this.ancestralDaisho = this.player1.findCardByName('ancestral-daisho');

            this.brash = this.player2.findCardByName('brash-samurai');
            this.kakitaBlade = this.player2.findCardByName('kakita-blade');
            this.elegantTessen = this.player2.findCardByName('elegant-tessen');
        });

        describe('when the opponent has a weapon', function () {
            beforeEach(function () {
                this.player1.pass();
                this.player2.playAttachment(this.kakitaBlade, this.brash);
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.togashiIchi, this.doomedShugenja],
                    defenders: [this.brash]
                });
            });

            it('should not be playable', function () {
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.palmStrike);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });
        });

        describe('when the monk has a weapon', function () {
            beforeEach(function () {
                this.player1.playAttachment(this.ancestralDaisho, this.togashiIchi);
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.togashiIchi, this.doomedShugenja],
                    defenders: [this.brash]
                });
            });

            it('should not be playable', function () {
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.palmStrike);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });
        });

        describe('when an non-tattooed monk and the opponent have no weapons', function () {
            beforeEach(function () {
                this.player1.playAttachment(this.ancestralDaisho, this.doomedShugenja);
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shrineMaiden, this.doomedShugenja],
                    defenders: [this.brash],
                    ring: 'void'
                });

                this.player2.pass();
                this.player1.clickCard(this.palmStrike);
                this.player1.clickCard(this.shrineMaiden);
                this.player1.clickCard(this.brash);
            });

            it('should bow the opponent', function () {
                expect(this.brash.bowed).toBe(true);
            });

            it('should not prevent the opponent from readying during the conflict', function () {
                this.player2.clickCard(this.elegantTessen);
                this.player2.clickCard(this.brash);
                this.player2.clickCard(this.elegantTessen);
                expect(this.brash.bowed).toBe(false);
            });

            it('displays messages', function () {
                expect(this.getChatLogs(5)).toContain('player1 plays Palm Strike to bow Brash Samurai');
                expect(this.getChatLogs(5)).not.toContain(
                    'Brash Samurai cannot ready until the end of the conflict - they are overwhelmed by the mystical tattoos of the Shrine Maiden!'
                );
            });
        });

        describe('when a tattooed monk and the opponent have no weapons', function () {
            beforeEach(function () {
                this.player1.playAttachment(this.ancestralDaisho, this.doomedShugenja);
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.togashiIchi, this.doomedShugenja],
                    defenders: [this.brash],
                    ring: 'void'
                });

                this.player2.pass();
                this.player1.clickCard(this.palmStrike);
                this.player1.clickCard(this.togashiIchi);
                this.player1.clickCard(this.brash);
            });

            it('should bow the opponent', function () {
                expect(this.brash.bowed).toBe(true);
            });

            it('should prevent the opponent from readying until the end of the conflict', function () {
                this.player2.clickCard(this.elegantTessen);
                this.player2.clickCard(this.brash);
                expect(this.player2).toHavePrompt('Waiting for opponent to take an action or pass');
                expect(this.brash.bowed).toBe(true);
            });

            it('displays messages', function () {
                expect(this.getChatLogs(5)).toContain('player1 plays Palm Strike to bow Brash Samurai');
                expect(this.getChatLogs(5)).toContain(
                    'Brash Samurai cannot ready until the end of the conflict - they are overwhelmed by the mystical tattoos of Togashi Ichi!'
                );
            });
        });
    });
});
