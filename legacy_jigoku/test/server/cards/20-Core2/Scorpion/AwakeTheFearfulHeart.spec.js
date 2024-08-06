describe('Awake the Fearful Heart', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    hand: ['awake-the-fearful-heart', 'one-with-the-sea'],
                    inPlay: ['bayushi-manipulator', 'cursecatcher']
                },
                player2: {
                    hand: ['one-with-the-sea'],
                    inPlay: ['fushicho', 'adept-of-the-waves']
                }
            });

            this.awake = this.player1.findCardByName('awake-the-fearful-heart');
            this.manipulatorFateless = this.player1.findCardByName('bayushi-manipulator');
            this.cursecatcher = this.player1.findCardByName('cursecatcher');
            this.cursecatcher.modifyFate(1);

            this.oneWithTheSea = this.player2.findCardByName('one-with-the-sea');
            this.fushichoFateless = this.player2.findCardByName('fushicho');
            this.adept = this.player2.findCardByName('adept-of-the-waves');
            this.adept.modifyFate(1);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.manipulatorFateless, this.cursecatcher],
                defenders: [this.fushichoFateless, this.adept],
                type: 'military'
            });

            this.player2.pass();
        });

        it('sends home all fateless characters', function () {
            this.player1.clickCard(this.awake);
            expect(this.manipulatorFateless.isParticipating()).toBe(false);
            expect(this.cursecatcher.isParticipating()).toBe(true);
            expect(this.fushichoFateless.isParticipating()).toBe(false);
            expect(this.adept.isParticipating()).toBe(true);
            expect(this.getChatLogs(5)).toContain(
                'player1 plays Awake the Fearful Heart to send Bayushi Manipulator and Fushichō home'
            );
            expect(this.getChatLogs(5)).toContain(
                'player1 channels their air affinity to forbid all players from moving characters into the conflict'
            );
        });

        it('with affinity, it prevents character movement', function () {
            this.player1.clickCard(this.awake);
            this.player2.clickCard(this.oneWithTheSea);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
