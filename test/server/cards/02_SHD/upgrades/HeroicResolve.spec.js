describe('Heroic Resolve', function() {
    integration(function() {
        describe('Heroic Resolve\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['heroic-resolve'] }],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should cost 2 resources and defeating the upgrade, then give the unit an attack with +4/+0 and Overwhelm', function () {
                this.player1.clickCard(this.battlefieldMarine);
                // TODO: configure action ability prompts to include costs
                expect(this.player1).toHaveEnabledPromptButton('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');

                this.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
                expect(this.player1).not.toHavePassAbilityButton();
                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.wampa]);

                this.player1.clickCard(this.wampa);
                expect(this.battlefieldMarine).toBeInLocation('discard');
                expect(this.heroicResolve).toBeInLocation('discard');
                expect(this.wampa).toBeInLocation('discard');
                expect(this.p2Base.damage).toBe(2);
            });
        });
    });
});
