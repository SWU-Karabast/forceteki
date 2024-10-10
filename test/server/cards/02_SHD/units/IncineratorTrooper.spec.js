describe('Incinerator Trooper', function() {
    integration(function() {
        describe('Incinerator Trooper\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['incinerator-trooper'],
                    },
                    player2: {
                        groundArena: ['jedha-agitator', 'wampa']

                    }
                });
            });

            it('should defeat enemy ground unit before taking damage.', function () {
                // Case 1 it defeats the ground unit before taking damage
                this.player1.clickCard(this.incineratorTrooper);
                this.player1.clickCard(this.jedhaAgitator);

                // check board state
                expect(this.incineratorTrooper.damage).toBe(0);
                expect(this.jedhaAgitator.location).toBe('discard');

                // Case 2 attacking wampa should defeat incinerator-trooper and give 2 damage to wampa
                this.player2.passAction();
                this.incineratorTrooper.exhausted = false;
                this.player1.clickCard(this.incineratorTrooper);
                this.player1.clickCard(this.wampa);

                // check board state
                expect(this.incineratorTrooper.location).toBe('discard');
                expect(this.wampa.damage).toBe(2);
            });
        });
    });
});