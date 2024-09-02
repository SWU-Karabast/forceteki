describe('Clan Wren Rescuer', function() {
    integration(function() {
        describe('Clan Wren Rescuer\'s when played ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['clan-wren-rescuer'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should give an experience token to a unit', function () {
                this.player1.clickCard(this.clanWrenRescuer);
                expect(this.player1).not.toHaveEnabledPromptButton('Pass ability');
                expect(this.player1).toBeAbleToSelectExactly([this.clanWrenRescuer, this.wampa, this.cartelSpacer]);

                this.player1.clickCard(this.clanWrenRescuer);
                expect(this.clanWrenRescuer.upgrades.length).toBe(1);
                expect(this.clanWrenRescuer.upgrades[0].internalName).toBe('experience');
            });
        });
    });
});
