describe('Leia Organa, Alliance General', function() {
    integration(function() {
        describe('Leia\'s undeployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', 'battlefield-marine', 'fleet-lieutenant', { card: 'rebel-pathfinder', exhausted: true }],
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
                expect(this.player1).not.toHaveEnabledPromptButton('Pass ability');

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

                expect(this.player2).toBeActivePlayer();
                expect(this.leiaOrgana.exhausted).toBe(true);
            });

            it('should allow passing the second attack', function () {
                this.player1.clickCard(this.leiaOrgana);
                this.player1.clickPrompt('Attack with a Rebel unit');
                expect(this.player1).toBeAbleToSelectExactly([this.battlefieldMarine, this.fleetLieutenant, this.allianceXwing]);
                expect(this.player1).not.toHaveEnabledPromptButton('Pass ability');

                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.regionalGovernor);
                expect(this.battlefieldMarine.exhausted).toBe(true);
                expect(this.regionalGovernor.damage).toBe(3);
                expect(this.battlefieldMarine.damage).toBe(1);

                // second attack
                expect(this.player1).toBeActivePlayer();
                expect(this.player1).toBeAbleToSelectExactly([this.fleetLieutenant, this.allianceXwing]);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');
                this.player1.clickPrompt('Pass ability');

                expect(this.player2).toBeActivePlayer();
                expect(this.leiaOrgana.exhausted).toBe(true);
            });
        });

        describe('Leia\'s deployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', 'fleet-lieutenant', { card: 'battlefield-marine', exhausted: true }],
                        spaceArena: ['alliance-xwing'],
                        leader: { card: 'leia-organa#alliance-general', deployed: true }
                    },
                    player2: {
                        groundArena: ['regional-governor'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should allow attacking with another Rebel unit', function () {
                this.player1.clickCard(this.leiaOrgana);
                this.player1.clickCard(this.regionalGovernor);

                expect(this.leiaOrgana.exhausted).toBe(true);
                expect(this.leiaOrgana.damage).toBe(1);
                expect(this.regionalGovernor).toBeInLocation('discard');

                expect(this.player1).toBeAbleToSelectExactly([this.fleetLieutenant, this.allianceXwing]);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');

                this.player1.clickCard(this.fleetLieutenant);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');
                this.player1.clickCard(this.p2Base);
                expect(this.fleetLieutenant.exhausted).toBe(true);
                expect(this.p2Base.damage).toBe(3);
                expect(this.fleetLieutenant.damage).toBe(0);

                this.player2.passAction();

                // second Leia attack to confirm that passing the ability works
                this.leiaOrgana.exhausted = false;
                this.player1.clickCard(this.leiaOrgana);
                this.player1.clickCard(this.p2Base);
                expect(this.leiaOrgana.exhausted).toBe(true);
                expect(this.p2Base.damage).toBe(6);

                expect(this.player1).toHaveEnabledPromptButton('Attack with another Rebel unit');
                expect(this.player1).toHaveEnabledPromptButton('Pass');
                this.player1.clickPrompt('Pass');

                this.player2.passAction();

                // third Leia attack to confirm that the ability isn't triggered if there is no legal attacker
                this.allianceXwing.exhausted = true;
                this.leiaOrgana.exhausted = false;
                this.player1.clickCard(this.leiaOrgana);
                this.player1.clickCard(this.p2Base);
                expect(this.leiaOrgana.exhausted).toBe(true);
                expect(this.p2Base.damage).toBe(9);

                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
