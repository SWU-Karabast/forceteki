describe('Aayla Secura, Master of the Blade', function() {
    integration(function(contextRef) {
        describe('Aayla Secura\'s on attack ability', function() {
            it('should prevent combat damage to Aayla when Coordinate condition is met', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['timely-intervention'],
                        groundArena: [
                            'aayla-secura#master-of-the-blade',
                            'battlefield-marine',
                            'clone-trooper',
                        ]
                    },
                    player2: {
                        hand: ['waylay', 'waylay', 'waylay'],
                        groundArena: [
                            'consular-security-force',
                            'tarfful#kashyyyk-chieftain',
                            'krrsantan#muscle-for-hire'
                        ]
                    }
                });

                const { context } = contextRef;
                context.firstWaylay = context.player2.hand[0];
                context.secondWaylay = context.player2.hand[1];
                context.thirdWaylay = context.player2.hand[2];

                const reset = (pass = true) => {
                    context.setDamage(context.aaylaSecura, 0);
                    context.setDamage(context.consularSecurityForce, 0);
                    context.aaylaSecura.exhausted = false;

                    if (pass) {
                        context.player2.passAction();
                    }
                };

                // CASE 1: Aayla is in play and attacks while Coordinate is active

                context.player1.clickCard(context.aaylaSecura);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.aaylaSecura.damage).toBe(0);
                expect(context.consularSecurityForce.damage).toBe(6);

                reset(false);

                // CASE 2: Aayla is in play and attacks while Coordinate is not active

                // Remove Battlefield Marine from the board to take coordinate offline
                context.player2.clickCard(context.firstWaylay);
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.aaylaSecura);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.aaylaSecura.damage).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(6);

                reset();

                // CASE 3: Opponent attacks Aayla while Coordinate is active

                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.aaylaSecura);

                expect(context.aaylaSecura.damage).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(6);

                reset(false);

                // CASE 4: Aayla ambushes to activate Coordinate

                // Set up - Player 1 passes and player 2 waylays Aayla
                context.player1.passAction();
                context.player2.clickCard(context.secondWaylay);
                context.player2.clickCard(context.aaylaSecura);

                expect(context.player1.groundArena.length).toBe(2);

                // Player 1 ambushes Aayla back into play, activating Coordinate and preventing combat damage
                context.player1.clickCard(context.timelyIntervention);
                context.player1.clickCard(context.aaylaSecura);
                context.player1.clickPrompt('Ambush');
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.aaylaSecura.damage).toBe(0);
                expect(context.consularSecurityForce.damage).toBe(6);

                // CASE 5: Aayla's ability does not block non-combat damage when she attacks (The Tarfful Situation)
                reset();

                context.player1.clickCard(context.aaylaSecura);
                context.player1.clickCard(context.krrsantan);

                expect(context.aaylaSecura.damage).toBe(0);
                expect(context.krrsantan.damage).toBe(6);

                context.player2.clickCard(context.aaylaSecura);

                expect(context.aaylaSecura).toBeInZone('discard');
            });

            it('works correctly when Aayla is shielded', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['moment-of-peace'],
                        groundArena: [
                            { card: 'aayla-secura#master-of-the-blade', upgrades: ['shield'] },
                            'battlefield-marine',
                            'clone-trooper',
                        ]
                    },
                    player2: {
                        groundArena: [
                            'consular-security-force',
                        ]
                    }
                });

                const { context } = contextRef;

                // CASE 1: User chooses to resolve Aayla's ability, preserving the shield

                context.player1.clickCard(context.aaylaSecura);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).toHaveExactPromptButtons([
                    'Defeat shield to prevent attached unit from taking damage',
                    'Prevent all combat damage that would be dealt to this unit'
                ]);

                context.player1.clickPrompt('Prevent all combat damage that would be dealt to this unit');

                expect(context.aaylaSecura.damage).toBe(0);
                expect(context.aaylaSecura.isUpgraded()).toBeTrue();
                expect(context.consularSecurityForce.damage).toBe(6);

                // Reset
                context.setDamage(context.consularSecurityForce, 0);
                context.aaylaSecura.exhausted = false;
                context.player2.passAction();

                // CASE 2: User chooses to defeat shield instead of preventing damage

                context.player1.clickCard(context.aaylaSecura);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).toHaveExactPromptButtons([
                    'Defeat shield to prevent attached unit from taking damage',
                    'Prevent all combat damage that would be dealt to this unit'
                ]);

                context.player1.clickPrompt('Defeat shield to prevent attached unit from taking damage');

                expect(context.aaylaSecura.damage).toBe(0);
                expect(context.aaylaSecura.isUpgraded()).toBeFalse();
                expect(context.consularSecurityForce.damage).toBe(6);
            });
        });
    });
});
