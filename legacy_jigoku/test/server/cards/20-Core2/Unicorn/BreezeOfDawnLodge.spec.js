describe('Breeze of Dawn Lodge', function () {
    integration(function () {
        describe('Conflict Action', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        stronghold: 'breeze-of-dawn-lodge',
                        inPlay: ['bayushi-manipulator', 'fushicho', 'solemn-scholar', 'iuchi-rimei']
                    },
                    player2: {},
                    skipAutoFirstPlayer: true
                });
                this.breezeOfDawnLodge = this.player1.findCardByName('breeze-of-dawn-lodge');
                this.bayushiManipulator = this.player1.findCardByName('bayushi-manipulator');
                this.fushicho = this.player1.findCardByName('fushicho');
                this.solemnScholar = this.player1.findCardByName('solemn-scholar');
                this.iuchiRimei = this.player1.findCardByName('iuchi-rimei');

                this.fushicho.bowed = true;
            });

            it('moves a ready character to the conflict', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.bayushiManipulator, this.solemnScholar],
                    defenders: []
                });

                this.solemnScholar.bowed = true;

                this.player2.pass();
                this.player1.clickCard(this.breezeOfDawnLodge);
                expect(this.player1).toHavePrompt('Choose a character');
                expect(this.player1).toBeAbleToSelect(this.bayushiManipulator);
                expect(this.player1).toBeAbleToSelect(this.iuchiRimei);
                expect(this.player1).not.toBeAbleToSelect(this.solemnScholar);
                expect(this.player1).not.toBeAbleToSelect(this.fushicho);

                this.player1.clickCard(this.iuchiRimei);
                expect(this.iuchiRimei.isParticipating()).toBe(true);
                expect(this.getChatLogs(3)).toContain(
                    'player1 uses Breeze of Dawn Lodge, bowing Breeze of Dawn Lodge to move Iuchi Rimei into the conflict'
                );
            });

            it('moves a ready character home', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.bayushiManipulator, this.solemnScholar],
                    defenders: []
                });

                this.solemnScholar.bowed = true;

                this.player2.pass();
                this.player1.clickCard(this.breezeOfDawnLodge);
                expect(this.player1).toHavePrompt('Choose a character');
                expect(this.player1).toBeAbleToSelect(this.bayushiManipulator);
                expect(this.player1).toBeAbleToSelect(this.iuchiRimei);
                expect(this.player1).not.toBeAbleToSelect(this.solemnScholar);
                expect(this.player1).not.toBeAbleToSelect(this.fushicho);

                this.player1.clickCard(this.bayushiManipulator);
                expect(this.bayushiManipulator.isParticipating()).toBe(false);
                expect(this.getChatLogs(3)).toContain(
                    'player1 uses Breeze of Dawn Lodge, bowing Breeze of Dawn Lodge to send Bayushi Manipulator home'
                );
            });
        });
    });
});