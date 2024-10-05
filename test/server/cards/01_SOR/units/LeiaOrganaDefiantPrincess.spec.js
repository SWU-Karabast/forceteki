describe('Leia Organa, Defiant Princess', function() {
    integration(function() {
        describe('Leia Organa, Defiant Princess\'s when played ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['leia-organa#defiant-princess'],
                        groundArena: [{ card: 'atst', exhausted: true }],
                        spaceArena: [{ card: 'cartel-spacer', exhausted: false }],
                        leader: { card: 'jyn-erso#resisting-oppression', deployed: true, exhausted: false }
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', exhausted: false }],
                        spaceArena: [{ card: 'alliance-xwing', exhausted: true }]
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

            it('should be able to exhaust an enemy unit', function () {
                this.player1.clickCard(this.leiaOrgana);
                this.player1.clickPrompt('Exhaust a unit');
                expect(this.player1).toBeAbleToSelectExactly([this.leiaOrgana, this.atst, this.cartelSpacer, this.jynErso, this.wampa, this.allianceXwing]);
                this.player1.clickCard(this.wampa);
                expect(this.wampa.exhausted).toBe(true);
            });

            it('should be able to exhaust a friendly unit', function () {
                this.player1.clickCard(this.leiaOrgana);
                this.player1.clickPrompt('Exhaust a unit');
                this.player1.clickCard(this.jynErso);
                expect(this.jynErso.exhausted).toBe(true);
            });
        });
    });
});
