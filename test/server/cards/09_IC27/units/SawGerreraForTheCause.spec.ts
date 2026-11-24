describe('Saw Gerrera, For the Cause', function() {
    integration(function(contextRef) {
        describe('Saw Gerrera\'s on attack ability', function() {
            it('should let the player double the power of another friendly unit for this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['saw-gerrera#for-the-cause', 'battlefield-marine'],
                        spaceArena: ['concord-dawn-interceptors'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                const { context } = contextRef;

                // Saw Gerrera attacks the base
                context.player1.clickCard(context.sawGerreraForTheCause);
                context.player1.clickCard(context.p2Base);

                // Only other friendly units can be chosen, and the ability is optional
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.concordDawnInterceptors,
                    context.bobaFett
                ]);
                expect(context.player1).toHavePassAbilityButton();

                // Double Battlefield Marine's power
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.getPower()).toBe(6);
                expect(context.p2Base.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();

                // The doubled power applies to the marine's own attack
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(12);

                // The effect expires at the end of the phase
                context.moveToNextActionPhase();
                expect(context.battlefieldMarine.getPower()).toBe(3);
            });

            it('should not change any unit\'s power if the player passes the ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['saw-gerrera#for-the-cause', 'battlefield-marine'],
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                // Saw Gerrera attacks the base and the player passes the ability
                context.player1.clickCard(context.sawGerreraForTheCause);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                // No unit's power changed
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.concordDawnInterceptors.getPower()).toBe(1);
                expect(context.sawGerreraForTheCause.getPower()).toBe(6);
                expect(context.p2Base.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });

            it('should double the target\'s current modified power', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'saw-gerrera#for-the-cause',
                            { card: 'battlefield-marine', upgrades: ['academy-training'] }
                        ]
                    }
                });

                const { context } = contextRef;
                expect(context.battlefieldMarine.getPower()).toBe(5);

                // Saw Gerrera attacks the base and doubles the upgraded marine's power
                context.player1.clickCard(context.sawGerreraForTheCause);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.getPower()).toBe(10);

                // Battlefield Marine attacks the base
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // 6 from Saw Gerrera + 10 from the marine
                expect(context.p2Base.damage).toBe(16);
            });

            it('should use a fixed value that is not recomputed when the target gains more power later', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['academy-training'],
                        groundArena: ['saw-gerrera#for-the-cause', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Saw Gerrera attacks the base and doubles Battlefield Marine's power
                context.player1.clickCard(context.sawGerreraForTheCause);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.getPower()).toBe(6);

                // Attach a +2/+2 upgrade after the doubling
                context.player2.passAction();
                context.player1.clickCard(context.academyTraining);
                context.player1.clickCard(context.battlefieldMarine);

                // 6 (doubled) + 2 (upgrade) = 8, not (3 + 2) * 2 = 10
                expect(context.battlefieldMarine.getPower()).toBe(8);

                // Battlefield Marine attacks the base
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // 6 from Saw Gerrera + 8 from the marine
                expect(context.p2Base.damage).toBe(14);
            });

            it('should allow targeting a friendly unit with 0 power without any effect', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['saw-gerrera#for-the-cause', 'grogu#irresistible']
                    }
                });

                const { context } = contextRef;

                // Saw Gerrera attacks the base and targets Grogu
                context.player1.clickCard(context.sawGerreraForTheCause);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.grogu]);
                context.player1.clickCard(context.grogu);

                // Grogu's power stays at 0
                expect(context.grogu.getPower()).toBe(0);
                expect(context.p2Base.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not prompt when Saw Gerrera is the only friendly unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['saw-gerrera#for-the-cause']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                const { context } = contextRef;

                // Saw Gerrera attacks the base, the ability has no targets and is skipped
                context.player1.clickCard(context.sawGerreraForTheCause);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });

            it('should keep the doubled power on the target if Saw Gerrera is defeated in the attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['saw-gerrera#for-the-cause', 'battlefield-marine']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Saw Gerrera attacks AT-ST and doubles Battlefield Marine's power
                context.player1.clickCard(context.sawGerreraForTheCause);
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.battlefieldMarine);

                // Saw Gerrera is defeated, the marine keeps its doubled power
                expect(context.sawGerreraForTheCause).toBeInZone('discard');
                expect(context.battlefieldMarine.getPower()).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not carry over to the target after it leaves play and returns', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['saw-gerrera#for-the-cause', 'battlefield-marine']
                    },
                    player2: {
                        hand: ['waylay']
                    }
                });

                const { context } = contextRef;

                // Saw Gerrera attacks the base and doubles Battlefield Marine's power
                context.player1.clickCard(context.sawGerreraForTheCause);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.getPower()).toBe(6);

                // Player 2 returns Battlefield Marine to hand with Waylay
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('hand');

                // Player 1 replays Battlefield Marine with its base power
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.battlefieldMarine.getPower()).toBe(3);
            });

            it('should not double Raid when the doubled unit attacks', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['saw-gerrera#for-the-cause', 'dune-sea-nomads']
                    }
                });

                const { context } = contextRef;

                // Saw Gerrera attacks the base and doubles Dune Sea Nomads' power
                context.player1.clickCard(context.sawGerreraForTheCause);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.duneSeaNomads);
                expect(context.duneSeaNomads.getPower()).toBe(6);
                expect(context.p2Base.damage).toBe(6);

                // Dune Sea Nomads attacks the base
                context.player2.passAction();
                context.player1.clickCard(context.duneSeaNomads);
                context.player1.clickCard(context.p2Base);

                // 6 from Saw Gerrera + 6 (doubled) + 3 (Raid) from the nomads, not (3 + 3) * 2
                expect(context.p2Base.damage).toBe(15);
            });

            it('should double power from a constant ability and keep the bonus after that ability ends', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'saw-gerrera#for-the-cause',
                            'battlefield-marine',
                            'general-dodonna#massassi-group-commander'
                        ]
                    },
                    player2: {
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;

                // General Dodonna gives other friendly Rebel units +1/+1
                expect(context.battlefieldMarine.getPower()).toBe(4);

                // Saw Gerrera attacks the base and doubles Battlefield Marine's power
                context.player1.clickCard(context.sawGerreraForTheCause);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.getPower()).toBe(8);
                expect(context.p2Base.damage).toBe(7);

                // Player 2 defeats General Dodonna
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.generalDodonna);
                expect(context.generalDodonna).toBeInZone('discard');

                // The marine loses Dodonna's +1 but keeps the fixed +4 from Saw Gerrera
                expect(context.battlefieldMarine.getPower()).toBe(7);

                // Battlefield Marine attacks the base
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // 7 from Saw Gerrera + 7 from the marine
                expect(context.p2Base.damage).toBe(14);
            });
        });
    });
});
