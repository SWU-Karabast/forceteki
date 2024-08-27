describe('Shield', function() {
    integration(function() {
        describe('Shield\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['shield'] }]
                    }
                });

                this.cartelSpacer = this.player1.findCardByName('cartel-spacer');
                this.tieLn = this.player2.findCardByName('tieln-fighter');
                this.shield = this.player2.findCardByName('shield');
            });

            it('should defeat itself to prevent damage to the attached unit', function () {
                this.player1.clickCard(this.cartelSpacer);
                this.player1.clickCard(this.tieLn);

                expect(this.cartelSpacer.damage).toBe(2);
                expect(this.tieLn.damage).toBe(0);

                // TODO THIS PR: token defeat logic
                expect(this.shield.location).toBe('discard');
            });
        });
    });
});
