describe('Sly Moore, Witness to Power', function() {
    integration(function(contextRef) {
        it('for this phase, each enemy unit gets -2/-0 while it\'s attacking a base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sly-moore#witness-to-power'],
                    groundArena: ['consular-security-force']
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            // Play Sly Moore, applying the phase-long effect
            context.player1.clickCard(context.slyMoore);

            // Opponent attacks base with Wampa (normally 4 power) => should be reduced by 2
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(2);

            context.player1.clickCard(context.consularSecurityForce);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(3);

            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.consularSecurityForce);
            expect(context.consularSecurityForce.damage).toBe(6);

            // reset damage
            context.setDamage(context.p1Base, 0);
            context.player1.passAction();

            // attack p1Base with another unit, should have -2
            context.player2.clickCard(context.greenSquadronAwing);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(1);

            // move to next phase, lasting effect should end
            context.moveToNextActionPhase();

            context.setDamage(context.p1Base, 0);

            context.player1.passAction();

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(4);
        });
        it('should debuff enemy units even if Sly Moore is defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sly-moore#witness-to-power'],
                    groundArena: ['consular-security-force']
                },
                player2: {
                    hand: ['vanquish'],
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            // Play Sly Moore, applying the phase-long effect
            context.player1.clickCard(context.slyMoore);

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.slyMoore);
            context.player1.passAction();

            // Opponent attacks base with Wampa (normally 4 power) => should be reduced by 2
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(2);

            // move to next phase, lasting effect should end
            context.moveToNextActionPhase();

            context.setDamage(context.p1Base, 0);

            context.player1.passAction();

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(4);
        });

        it('should not affect units played/deployed after Sly Moore', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sly-moore#witness-to-power'],
                    groundArena: ['consular-security-force']
                },
                player2: {
                    leader: 'sabine-wren#galvanized-revolutionary',
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            // Play Sly Moore, applying the phase-long effect
            context.player1.clickCard(context.slyMoore);

            context.player2.clickCard(context.sabineWren);
            context.player2.clickPrompt('Deploy Sabine Wren');

            context.player1.passAction();

            context.player2.clickCard(context.sabineWren);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(3);
        });
    });
});
