describe('Chirrut Imwe, Blind, but not Deaf', function() {
    integration(function(contextRef) {
        describe('Chirrut Imwe\'s when attacked ability', function() {
            it('should allow to use the Force to give -2/-0 to the attacker for this attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['chirrut-imwe#blind-but-not-deaf', 'perimeter-atrt'],
                        hasForceToken: true,
                    },
                    player2: {
                        groundArena: ['bold-recon-commando'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.boldReconCommando);
                context.player2.clickCard(context.chirrutImwe);
                context.player2.clickPrompt('You');
                expect(context.player1).toHavePassAbilityPrompt('Use the Force to give -2/-0 to the attacker for this attack');

                context.player1.clickPrompt('Trigger');
                expect(context.boldReconCommando.damage).toBe(3);
                expect(context.chirrutImwe.damage).toBe(1);

                // Ensure that the -2/-0 effect is not permanent
                context.player1.passAction();
                context.readyCard(context.boldReconCommando);

                context.player2.clickCard(context.boldReconCommando);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(3);
            });

            it('should not give -2/-0 to the attacker if the Force is not used', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['chirrut-imwe#blind-but-not-deaf', 'perimeter-atrt'],
                        hasForceToken: true,
                    },
                    player2: {
                        groundArena: ['bold-recon-commando'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.boldReconCommando);
                context.player2.clickCard(context.chirrutImwe);
                context.player2.clickPrompt('You');
                expect(context.player1).toHavePassAbilityPrompt('Use the Force to give -2/-0 to the attacker for this attack');

                context.player1.clickPrompt('Pass');
                expect(context.boldReconCommando.damage).toBe(3);
                expect(context.chirrutImwe.damage).toBe(3);
            });

            it('should not prompt the user if they do not have the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['chirrut-imwe#blind-but-not-deaf', 'perimeter-atrt'],
                        hasForceToken: false,
                    },
                    player2: {
                        groundArena: ['bold-recon-commando'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.boldReconCommando);
                context.player2.clickCard(context.chirrutImwe);
                expect(context.boldReconCommando.damage).toBe(3);
                expect(context.chirrutImwe.damage).toBe(3);
            });

            it('should work correctly when multiple units are attacked', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['chirrut-imwe#blind-but-not-deaf', 'perimeter-atrt'],
                        hasForceToken: true,
                    },
                    player2: {
                        groundArena: ['darth-maul#revenge-at-last'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.darthMaul);
                context.player2.clickCard(context.perimeterAtrt);
                context.player2.clickCard(context.chirrutImwe);
                context.player2.clickPrompt('Done');
                expect(context.player1).toHavePassAbilityPrompt('Use the Force to give -2/-0 to the attacker for this attack');

                context.player1.clickPrompt('Trigger');
                expect(context.chirrutImwe.damage).toBe(3);
                expect(context.perimeterAtrt.damage).toBe(3);
            });
        });
    });
});
