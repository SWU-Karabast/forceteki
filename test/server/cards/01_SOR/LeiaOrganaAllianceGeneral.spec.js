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

        describe('Leia\'s undeployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', { card: 'battlefield-marine', exhausted: true }],
                        spaceArena: ['alliance-xwing'],
                        leader: 'leia-organa#alliance-general'
                    },
                    player2: {
                        groundArena: ['regional-governor'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should skip the second attack if no target is available', function () {
                this.player1.clickCard(this.leiaOrgana);
                this.player1.clickPrompt('Attack with a Rebel unit');

                // jump directly to target selection since only one legal attacker
                this.player1.clickCard(this.cartelSpacer);
                expect(this.allianceXwing.exhausted).toBe(true);
                expect(this.cartelSpacer.damage).toBe(2);
                expect(this.allianceXwing.damage).toBe(2);

                expect(this.player2).toBeActivePlayer();
                expect(this.leiaOrgana.exhausted).toBe(true);
            });
        });
    });
});
