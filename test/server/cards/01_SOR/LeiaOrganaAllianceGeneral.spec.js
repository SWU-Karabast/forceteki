describe('Leia Organa, Alliance General', function() {
    integration(function() {
        describe('Leia\'s undeployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', 'battlefield-marine', 'fleet-lieutenant'],
                        spaceArena: ['tieln-fighter', 'alliance-xwing'],
                        leader: 'leia-organa#alliance-general'
                    },
                    player2: {
                        groundArena: ['regional-governor'],
                        spaceArena: ['tie-advanced']
                    }
                });
            });

            it('should attack with two Rebel units', function () {
                this.player1.clickCard(this.leiaOrgana);
                this.player1.clickPrompt('Attack with a Rebel unit');
                expect(this.player1).toBeAbleToSelectExactly([this.battlefieldMarine, this.fleetLieutenant, this.allianceXwing]);

                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.regionalGovernor);
                expect(this.battlefieldMarine.exhausted).toBe(true);
                expect(this.regionalGovernor.damage).toBe(3);
                expect(this.battlefieldMarine.damage).toBe(1);

                // second attack
                expect(this.player1).toBeActivePlayer();
                expect(this.player1).toBeAbleToSelectExactly([this.fleetLieutenant, this.allianceXwing]);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');
                this.player1.clickCard(this.allianceXwing);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');
                this.player1.clickCard(this.p2Base);
                expect(this.allianceXwing.exhausted).toBe(true);
                expect(this.p2Base.damage).toBe(2);
            });
        });
    });
});
