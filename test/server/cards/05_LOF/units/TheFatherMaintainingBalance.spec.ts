describe('The Father, Maintaining Balance', function() {
    integration(function(contextRef) {
        describe('The Father\'s ability', function() {
            const prompt = 'Deal 1 damage to this unit. If you do, the Force is with you.';
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'ahsoka-tano#fighting-for-peace',
                        hand: ['cure-wounds'],
                        groundArena: [
                            'consular-security-force',
                            {
                                card: 'the-father#maintaining-balance',
                                damage: 9
                            }
                        ],
                        hasForceToken: true
                    },
                    player2: {
                        hand: ['sorcerous-blast'],
                        hasForceToken: true
                    }
                });
            });

            it('when the Force is used, it should deal 1 damage to The Father regain the Force', function() {
                const { context } = contextRef;

                // Play Cure Wounds to Use the Force and heal 6 damage from The Father
                context.player1.clickCard(context.cureWounds);
                context.player1.clickCard(context.theFather);

                // Force was used, and healing happens before The Father's ability triggers
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.theFather.damage).toBe(3);

                // Ability triggers
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt('Trigger');

                // The Father should take 1 damage, and the player should regain the Force
                expect(context.theFather.damage).toBe(4);
                expect(context.player1.hasTheForce).toBeTrue();
            });

            it('can be used when the player uses the Force as the cost of an action ability', function() {
                const { context } = contextRef;

                // Use Ahsoka Tano's ability to give Consular Security Force sentinel
                context.player1.clickCard(context.ahsokaTano);
                context.player1.clickPrompt('Give a friendly unit Sentinel for this phase');
                context.player1.clickCard(context.consularSecurityForce);

                // Ability triggers
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt('Trigger');

                // The Father takes 1 damage (and is defeated), and the player regains the Force
                expect(context.theFather).toBeInZone('discard');
                expect(context.player1.hasTheForce).toBeTrue();
            });

            it('does not trigger if the opponent uses the Force', function() {
                const { context } = contextRef;
                context.player1.passAction();

                // Player 2 uses Sorcerous Blast to use the Force and deal 3 damage to Consular Security Force
                context.player2.clickCard(context.sorcerousBlast);
                context.player2.clickCard(context.consularSecurityForce);

                // Force was used, but The Father does not trigger
                expect(context.player2.hasTheForce).toBeFalse();
                expect(context.consularSecurityForce.damage).toBe(3);
                expect(context.player1).toBeActivePlayer();
            });

            it('is an optional ability that can be passed', function() {
                const { context } = contextRef;

                // Use Ahsoka Tano's ability to give Consular Security Force sentinel
                context.player1.clickCard(context.ahsokaTano);
                context.player1.clickPrompt('Give a friendly unit Sentinel for this phase');
                context.player1.clickCard(context.consularSecurityForce);

                // Ability triggers
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt('Pass');

                // The Father does not take damage, and the player does not regain the Force
                expect(context.theFather.damage).toBe(9);
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
