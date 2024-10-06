describe('Leia Organa, Defiant Princess', function() {
    integration(function() {
        describe('Leia Organa, Defiant Princess\'s when played ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['leia-organa#defiant-princess'],
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'cartel-spacer', exhausted: false }],
                        leader: { card: 'jyn-erso#resisting-oppression', deployed: true, exhausted: false }
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', exhausted: false }],
                        spaceArena: ['alliance-xwing']
                    }
                });
            });

            it('should be able to ready a friendly resource', function () {
                this.player1.clickCard(this.leiaOrgana);
                expect(this.player1).toHaveEnabledPromptButtons(['Ready a resource', 'Exhaust a unit']);
                const exhaustedResourcesBeforeAbility = this.player1.countExhaustedResources();
                this.player1.clickPrompt('Ready a resource');
                expect(this.player1.countExhaustedResources()).toBe(exhaustedResourcesBeforeAbility - 1);
            });

            it('should be able to exhaust any unit', function () {
                this.player1.clickCard(this.leiaOrgana);
                this.player1.clickPrompt('Exhaust a unit');
                expect(this.player1).toBeAbleToSelectExactly([this.leiaOrgana, this.atst, this.cartelSpacer, this.jynErso, this.wampa, this.allianceXwing]);
                this.player1.clickCard(this.wampa);
                expect(this.wampa.exhausted).toBe(true);
            });
        });

        describe('Leia Organa, Defiant Princess\'s when played ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['leia-organa#defiant-princess']
                    }
                });
            });

            it('should do nothing if the controller selects "Exhaust a unit" when no other unit is on the field', function () {
                this.player1.clickCard(this.leiaOrgana);
                this.player1.clickPrompt('Exhaust a unit');
                expect(this.player2).toBeActivePlayer();
                expect(this.leiaOrgana).toBeInLocation('ground arena');
                expect(this.leiaOrgana.exhausted).toBe(true);
            });
        });
    });
});
