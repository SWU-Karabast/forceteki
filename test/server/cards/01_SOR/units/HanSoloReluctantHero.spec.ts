describe('Han Solo Reluctant Hero', function() {
    integration(function(contextRef) {
        describe('Han Solo Reluctant Hero\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['han-solo#reluctant-hero'],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['shield'] }, 'consular-security-force', 'battlefield-marine']

                    }
                });
            });

            it('while attacking an enemy ground unit, should deal damage to the defender before taking damage.', function () {
                const { context } = contextRef;
                const reset = () => {
                    context.hanSolo.exhausted = false;
                    context.setDamage(context.hanSolo, 0);
                    context.setDamage(context.consularSecurityForce, 0);
                    context.consularSecurityForce.exhausted = false;
                };
                // Case 1 attack action shouldn't deal damage to the shielded wampa and should deal 4 damage to Han Solo
                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Ambush');
                context.player1.clickCard(context.wampa);

                // check board state
                expect(context.hanSolo.damage).toBe(4);
                expect(context.wampa.damage).toBe(0);

                // reset board
                reset();

                context.player2.passAction();
                // Case 2 attack action should defeat wampa and no damage on hansolo
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.wampa);

                // check board state
                expect(context.hanSolo.damage).toBe(0);
                expect(context.wampa.location).toBe('discard');

                // Case 3 attack action should deal 6 damage to consular security force and 3 on han solo
                context.player2.passAction();
                context.hanSolo.exhausted = false;
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.consularSecurityForce);

                // check board state
                expect(context.consularSecurityForce.damage).toBe(6);
                expect(context.hanSolo.damage).toBe(3);

                // reset board
                reset();

                // Case 4 check if Han Solo takes damage
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.hanSolo);

                // check board state
                expect(context.hanSolo.damage).toBe(3);
                expect(context.battlefieldMarine.location).toBe('discard');

                // reset board
                reset();

                // Case 5 han solo dies
                context.setDamage(context.hanSolo, 3);
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.consularSecurityForce);

                // Check board state
                expect(context.hanSolo.location).toBe('discard');
            });
        });
    });
});
