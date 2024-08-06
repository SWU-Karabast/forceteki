describe('Moto Stables', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['moto-youth', 'wild-stallion', 'utaku-infantry', 'moto-juro'],
                    dynastyDiscard: ['moto-stables'],
                    hand: ['charge']
                }
            });

            this.motoYouth = this.player1.findCardByName('moto-youth');
            this.stallion = this.player1.findCardByName('wild-stallion');
            this.infantry = this.player1.findCardByName('utaku-infantry');
            this.juro = this.player1.findCardByName('moto-juro');
            this.motoStables = this.player1.placeCardInProvince('moto-stables', 'province 1');
        });

        it('should react to a character moving to the conflict', function() {
            this.noMoreActions();

            this.initiateConflict({
                type: 'military',
                attackers: [this.motoYouth],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.stallion);
            this.player1.clickCard(this.infantry);
            expect(this.stallion.isParticipating()).toBe(true);
            expect(this.infantry.isParticipating()).toBe(true);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.motoStables);
        });

        it('should modify the military skill by +2', function() {
            this.noMoreActions();

            this.initiateConflict({
                type: 'military',
                attackers: [this.motoYouth],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.juro);
            this.player1.clickCard(this.motoStables);

            expect(this.juro.militarySkill).toBe(this.juro.printedMilitarySkill + 2);
        });

        it('should only be able to react twice per round', function() {
            this.noMoreActions();

            this.initiateConflict({
                type: 'military',
                attackers: [this.motoYouth],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.stallion);
            this.player1.clickCard(this.infantry);
            expect(this.stallion.isParticipating()).toBe(true);
            expect(this.infantry.isParticipating()).toBe(true);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.motoStables);
            this.player1.clickCard(this.stallion);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.motoStables);

            this.player2.pass();

            this.player1.clickCard(this.juro);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.juro.isParticipating()).toBe(true);
        });
    });
});
