describe('Han Solo Reluctant Hero', function() {
    integration(function() {
        describe('Han Solo Reluctant Hero\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['han-solo#reluctant-hero'],
                    },
                    player2: {
                        groundArena: ['wampa', 'consular-security-force']

                    }
                });
            });

            it('should defeat enemy ground unit before taking damage.', function () {
                // Case 1 attack action should defeat wampa and no damage on hansolo
                this.player1.clickCard(this.hanSolo);
                this.player1.clickPrompt('Ambush');
                this.player1.clickCard(this.wampa);

                // check board state
                expect(this.hanSolo.damage).toBe(0);
                expect(this.wampa.location).toBe('discard');

                // Case 2 attack action should deal 6 damage to consular security force and 3 on han solo
                this.player2.passAction();
                this.hanSolo.exhausted = false;
                this.player1.clickCard(this.hanSolo);
                this.player1.clickCard(this.consularSecurityForce);

                // check board state
                expect(this.consularSecurityForce.damage).toBe(6);
                expect(this.hanSolo.damage).toBe(3);
            });
        });
    });
});
