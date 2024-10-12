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
                        groundArena: [{ card: 'wampa', upgrades: ['shield'] }, 'consular-security-force']

                    }
                });
            });

            it('while attacking an enemy ground unit, should deal damage to the defender before taking damage.', function () {
                const reset = () => {
                    this.hanSolo.exhausted = false;
                    this.hanSolo.damage = 0;
                    this.consularSecurityForce.damage = 0;
                    this.consularSecurityForce.exhausted = false;
                    this.player2.passAction();
                };
                // Case 1 attack action shouldn't deal damage to the shielded wampa and should deal 4 damage to Han Solo
                this.player1.clickCard(this.hanSolo);
                this.player1.clickPrompt('Ambush');
                this.player1.clickCard(this.wampa);

                // check board state
                expect(this.hanSolo.damage).toBe(4);
                expect(this.wampa.damage).toBe(0);

                // reset board
                reset();

                // Case 2 attack action should defeat wampa and no damage on hansolo
                this.player1.clickCard(this.hanSolo);
                this.player1.clickCard(this.wampa);

                // check board state
                expect(this.hanSolo.damage).toBe(0);
                expect(this.wampa.location).toBe('discard');

                // Case 3 attack action should deal 6 damage to consular security force and 3 on han solo
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
