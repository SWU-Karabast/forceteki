describe('Shiba Yohana', function () {
    integration(function () {
        describe('Harpoon action', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['shiba-yohana', 'solemn-scholar', 'adept-of-the-waves', 'wandering-ronin']
                    },
                    player2: {
                        inPlay: ['doji-challenger', 'doji-kuwanan', 'daidoji-ambusher']
                    }
                });

                this.shibaYohana = this.player1.findCardByName('shiba-yohana');
                this.solemnOrdinary = this.player1.findCardByName('solemn-scholar');
                this.adeptHonored = this.player1.findCardByName('adept-of-the-waves');
                this.adeptHonored.honor();
                this.roninDishonored = this.player1.findCardByName('wandering-ronin');
                this.roninDishonored.dishonor();
                this.challengerOrdinary = this.player2.findCardByName('doji-challenger');
                this.kuwananHonored = this.player2.findCardByName('doji-kuwanan');
                this.kuwananHonored.honor();
                this.ambusherDishonored = this.player2.findCardByName('daidoji-ambusher');
                this.ambusherDishonored.dishonor();

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.shibaYohana],
                    defenders: []
                });
            });

            it('moves an honored or dishonored character to the conflict', function () {
                this.player2.pass();
                this.player1.clickCard(this.shibaYohana);
                expect(this.player1).toHavePrompt('Choose a character');

                expect(this.player1).not.toBeAbleToSelect(this.solemnOrdinary);
                expect(this.player1).toBeAbleToSelect(this.adeptHonored);
                expect(this.player1).toBeAbleToSelect(this.roninDishonored);
                expect(this.player1).not.toBeAbleToSelect(this.challengerOrdinary);
                expect(this.player1).toBeAbleToSelect(this.kuwananHonored);
                expect(this.player1).toBeAbleToSelect(this.ambusherDishonored);

                this.player1.clickCard(this.ambusherDishonored);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Shiba Yohana to move Daidōji Ambusher into the conflict'
                );
            });
        });

        describe('Save interrupt', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['shiba-yohana']
                    },
                    player2: {
                        hand: ['noble-sacrifice'],
                        inPlay: ['doji-kuwanan']
                    }
                });

                this.shibaYohana = this.player1.findCardByName('shiba-yohana');
                this.shibaYohana.dishonor();

                this.nobleSacrifice = this.player2.findCardByName('noble-sacrifice');
                this.kuwananHonored = this.player2.findCardByName('doji-kuwanan');
                this.kuwananHonored.honor();

                this.player1.pass();
            });

            it('does not survive when already tainted', function () {
                this.shibaYohana.taint();

                this.player2.clickCard(this.nobleSacrifice);
                this.player2.clickCard(this.shibaYohana);
                this.player2.clickCard(this.kuwananHonored);
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
            });

            it('survives kill', function () {
                this.player2.clickCard(this.nobleSacrifice);
                this.player2.clickCard(this.shibaYohana);
                this.player2.clickCard(this.kuwananHonored);
                expect(this.player1).toHavePrompt('Triggered Abilities');

                this.player1.clickCard(this.shibaYohana);
                expect(this.shibaYohana.location).toBe('play area');
                expect(this.shibaYohana.isTainted).toBe(true);
                expect(this.shibaYohana.hasTrait('spirit')).toBe(true);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Shiba Yohana to prevent Shiba Yohana from leaving play - vengeance and destruction sustains her in a damned existence'
                );
            });

            it('survives fate phase', function () {
                this.flow.nextPhase();
                expect(this.player1).toHavePrompt('Fate Phase');

                this.player1.clickCard(this.shibaYohana);
                expect(this.player1).toHavePrompt('Triggered Abilities');

                this.player1.clickCard(this.shibaYohana);
                expect(this.shibaYohana.location).toBe('play area');
                expect(this.shibaYohana.isTainted).toBe(true);
                expect(this.shibaYohana.hasTrait('spirit')).toBe(true);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Shiba Yohana to prevent Shiba Yohana from leaving play - vengeance and destruction sustains her in a damned existence'
                );
            });
        });
    });
});