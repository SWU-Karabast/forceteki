describe('Jango Fett, Guarding the Count', function() {
    integration(function(contextRef) {
        it('Jango Fett\'s abilities should give Jango Fett Ambush when an enemy unit has attacked your base this phase and on attack he should give -3/-0 to an enemy unit for this phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jango-fett#guarding-the-count'],
                },
                player2: {
                    groundArena: ['consular-security-force'],
                    spaceArena: ['awing'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            // Opponent attacks the base
            context.player2.clickCard(context.consularSecurityForce);
            context.player2.clickCard(context.p1Base);

            // Player 1 plays Jango Fett and should have Ambush
            context.player1.clickCard(context.jangoFett);
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            // Jango Fett should be able to attack immediately with Ambush
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.player1).toHavePrompt('Give an enemy unit –3/–0 for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.awing]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.consularSecurityForce.damage).toBe(5);
            expect(context.jangoFett.damage).toBe(0);

            expect(context.consularSecurityForce.getPower()).toBe(0);
            expect(context.consularSecurityForce.getHp()).toBe(7);

            // next phase, stat should be normal
            context.moveToNextActionPhase();

            expect(context.consularSecurityForce.getPower()).toBe(3);
            expect(context.consularSecurityForce.getHp()).toBe(7);
        });

        it('Jango Fett\'s abilities should not give Jango Fett Ambush when no enemy unit has attacked your base this phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jango-fett#guarding-the-count'],
                },
                player2: {
                    groundArena: ['wampa'],
                }
            });

            const { context } = contextRef;

            // Player 1 plays Jango Fett without any base attack happening
            context.player1.clickCard(context.jangoFett);
            expect(context.player2).toBeActivePlayer();
            expect(context.jangoFett.exhausted).toBeTrue();
        });

        it('Jango Fett\'s abilities should lose Ambush keywords after the phase ends, and should gain Ambush again even if he is in play', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jango-fett#guarding-the-count'],
                    leader: { card: 'boba-fett#daimyo', deployed: true }
                },
                player2: {
                    hasInitiative: true,
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.awing);
            context.player2.clickCard(context.p1Base);

            context.player1.clickCard(context.jangoFett);

            expect(context.jangoFett.getPower()).toBe(6);
            expect(context.jangoFett.getHp()).toBe(5);

            context.moveToNextActionPhase();

            expect(context.jangoFett.getPower()).toBe(5);
            expect(context.jangoFett.getHp()).toBe(5);

            context.player2.clickCard(context.awing);
            context.player2.clickCard(context.p1Base);

            expect(context.jangoFett.getPower()).toBe(6);
            expect(context.jangoFett.getHp()).toBe(5);
        });
    });
});
