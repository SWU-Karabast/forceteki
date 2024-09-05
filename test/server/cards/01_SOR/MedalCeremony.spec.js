describe('Medal Ceremony', function() {
    integration(function() {
        describe('Medal Ceremony\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['medal-ceremony'],
                        groundArena: ['battlefield-marine', 'frontier-atrt', 'alliance-dispatcher', 'rebel-pathfinder'],
                        // leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true } // TODO: merge leader PR
                    },
                    player2: {
                        groundArena: ['wampa', 'consular-security-force'],
                        spaceArena: ['alliance-xwing']
                    }
                });
            });

            it('should give an experience to any Rebel units that attacked this phase, up to 3', function () {
                // attack 1: our rebel
                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.p2Base);

                // attack 2: their non-rebel
                this.player2.clickCard(this.wampa);
                this.player2.clickCard(this.p1Base);

                // // attack 3: our rebel (leader)
                // this.player1.clickCard(this.chirrutImwe);
                // this.player1.clickCard(this.wampa);

                // attack 3: our rebel
                this.player1.clickCard(this.rebelPathfinder);
                this.player1.clickCard(this.p2Base);

                // attack 4: their rebel
                this.player2.clickCard(this.consularSecurityForce);
                this.player2.clickCard(this.p1Base);

                // attack 5: our non-rebel
                this.player1.clickCard(this.frontierAtrt);
                this.player1.clickCard(this.p2Base);

                // attack 6: their rebel
                this.player2.clickCard(this.allianceXwing);

                // attack 7: our rebel (goes to discard)
                this.player1.clickCard(this.allianceDispatcher);
                this.player1.clickCard(this.wampa);

                this.player2.passAction();

                this.player1.clickCard(this.medalCeremony);
                expect(this.player1).toBeAbleToSelectExactly([this.battlefieldMarine, this.rebelPathfinder, this.consularSecurityForce, this.allianceXwing]);

                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.rebelPathfinder);
                this.player1.clickCard(this.allianceXwing);
                // click on a fourth card just to confirm it doesn't work
                this.player1.clickCard(this.consularSecurityForce);
                this.player1.clickPrompt('Done');
                expect(this.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
                expect(this.rebelPathfinder).toHaveExactUpgradeNames(['experience']);
                expect(this.allianceXwing).toHaveExactUpgradeNames(['experience']);
                expect(this.consularSecurityForce.upgrades.length).toBe(0);
            });
        });
    });
});
