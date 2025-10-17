describe('Cassian Andor, Climb!', function() {
    integration(function(contextRef) {
        describe('Cassian Andor\'s leader side constant ability', function() {
            const cannotBeAttacked = (card: Card, game: Game) => {
                return card.getSummary(game.actionPhaseActivePlayer).cannotBeAttacked;
            };

            it('prevents friendly units from being attacked if they dealt combat damage to an opponent\'s base this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cassian-andor#climb',
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['warrior-drone']
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine attacks P2's base
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Battlefield Marine is no longer a valid target for Warrior Drone to attack
                context.player2.clickCard(context.warriorDrone);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
                expect(cannotBeAttacked(context.battlefieldMarine, context.game)).toBeTrue();

                // Cancel the attack and claim initiative to end the phase
                context.player2.clickPrompt('Cancel');
                context.player2.claimInitiative();
                context.moveToNextActionPhase();

                // Battlefield Marine can be attacked again
                context.player2.clickCard(context.warriorDrone);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.p1Base]);
                expect(cannotBeAttacked(context.battlefieldMarine, context.game)).toBeFalse();
                context.player2.clickCard(context.battlefieldMarine);
            });

            it('prevents friendly units from being attacked if they dealt indirect damage to an opponent\'s base this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cassian-andor#climb',
                        hand: ['guerilla-soldier']
                    },
                    player2: {
                        groundArena: ['warrior-drone']
                    }
                });

                const { context } = contextRef;

                // Player 1 plays Guerilla Soldier
                context.player1.clickCard(context.guerillaSoldier);
                expect(context.player1).toHavePrompt('Choose a player to deal 3 indirect damage to');

                // Deal indirect damage to opponent, including their base
                context.player1.clickPrompt('Deal indirect damage to opponent');
                expect(context.player2).toBeAbleToSelectExactly([context.warriorDrone, context.p2Base]);
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.warriorDrone, 2],
                    [context.p2Base, 1],
                ]));

                // Guerilla Soldier is now protected from attacks
                context.player2.clickCard(context.warriorDrone);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
                expect(cannotBeAttacked(context.guerillaSoldier, context.game)).toBeTrue();
                context.player2.clickCard(context.p1Base);
            });

            it('prevents friendly units from being attacked if they dealt damage to an opponent\'s base with an ability this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cassian-andor#climb',
                        hand: ['reckless-gunslinger']
                    },
                    player2: {
                        groundArena: ['warrior-drone']
                    }
                });

                const { context } = contextRef;

                // Player 1 plays Reckless Gunslinger (deals damage to both bases)
                context.player1.clickCard(context.recklessGunslinger);

                // Reckless Gunslinger is now protected from attacks
                context.player2.clickCard(context.warriorDrone);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
                expect(cannotBeAttacked(context.recklessGunslinger, context.game)).toBeTrue();
                context.player2.clickCard(context.p1Base);
            });

            it('prevents friendly units from being attacked if they dealt overwhelm damage to an opponent\'s base this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cassian-andor#climb',
                        groundArena: ['steadfast-battalion']
                    },
                    player2: {
                        groundArena: ['warrior-drone', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Steadfast Battalion attacks Battlefield Marine with overwhelm
                context.player1.clickCard(context.steadfastBattalion);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.p2Base.damage).toBe(2);

                // Steadfast Battalion cannot be attacked due to dealing overwhelm damage
                context.player2.clickCard(context.warriorDrone);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
                expect(cannotBeAttacked(context.steadfastBattalion, context.game)).toBeTrue();
                context.player2.clickCard(context.p1Base);
            });

            it('does not prevent friendly units from being attacked if they dealt damage to their own base this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cassian-andor#climb',
                        groundArena: ['sabine-wren#explosives-artist']
                    },
                    player2: {
                        groundArena: ['warrior-drone']
                    }
                });

                const { context } = contextRef;

                // Sabine attacks an enemy unit, then chooses to damage P1's own base
                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.warriorDrone);

                // Sabine's ability triggers - choose to damage own base
                expect(context.player1).toHavePrompt('Deal 1 damage to the defender or a base');
                context.player1.clickCard(context.p1Base);

                // Sabine should NOT be protected since she damaged her own base
                context.player2.clickCard(context.warriorDrone);
                expect(context.player2).toBeAbleToSelectExactly([context.sabineWren, context.p1Base]);
                expect(cannotBeAttacked(context.sabineWren, context.game)).toBeFalse();
                context.player2.clickCard(context.sabineWren);
            });

            it('does not apply the effect to enemy units that damage their own base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cassian-andor#climb',
                        groundArena: ['warrior-drone']
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['sabine-wren#explosives-artist']
                    }
                });

                const { context } = contextRef;

                // Enemy Sabine attacks P1's unit, then damages P2's own base
                context.player2.clickCard(context.sabineWren);
                context.player2.clickCard(context.warriorDrone);

                // Sabine's ability triggers - P2 chooses to damage their own base
                expect(context.player2).toHavePrompt('Deal 1 damage to the defender or a base');
                context.player2.clickCard(context.p2Base);

                // Enemy Sabine should NOT be protected by Cassian's ability
                context.player1.clickCard(context.warriorDrone);
                expect(context.player1).toBeAbleToSelectExactly([context.sabineWren, context.p2Base]);
                expect(cannotBeAttacked(context.sabineWren, context.game)).toBeFalse();
                context.player1.clickCard(context.sabineWren);
            });

            it('does not apply the effect to enemy units that deal damage to our base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cassian-andor#climb',
                        groundArena: ['warrior-drone']
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Enemy Battlefield Marine attacks P1's base
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);

                // Enemy Battlefield Marine should NOT be protected by Cassian's ability
                context.player1.clickCard(context.warriorDrone);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.p2Base]);
                expect(cannotBeAttacked(context.battlefieldMarine, context.game)).toBeFalse();
                context.player1.clickCard(context.battlefieldMarine);
            });

            it('stops affecting units that change control, and are no longer friendly', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cassian-andor#climb',
                        groundArena: ['battlefield-marine', 'warrior-drone']
                    },
                    player2: {
                        hand: ['change-of-heart']
                    }
                });

                const { context } = contextRef;

                // P1's Battlefield Marine attacks P2's base
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Battlefield Marine cannot be attacked
                expect(cannotBeAttacked(context.battlefieldMarine, context.game)).toBeTrue();

                // P2 plays Change of Heart to steal the Battlefield Marine
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.battlefieldMarine);

                // Battlefield Marine is no longer friendly to P1, so it can be attacked
                context.player1.clickCard(context.warriorDrone);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.p2Base]);
                expect(cannotBeAttacked(context.battlefieldMarine, context.game)).toBeFalse();
                context.player1.clickCard(context.battlefieldMarine);
            });
        });

        describe('Cassian Andor\'s unit side constant ability', function() {
            it('prevents Cassian from being defeated by having no remaining HP while you have the initiative (damage)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cassian-andor#climb', deployed: true }
                    },
                    player2: {
                        hand: ['open-fire']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                // Player 2 plays Open Fire to deal 4 damage to Cassian
                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.cassianAndor);

                // Cassian should still be in play with no remaining HP
                expect(context.cassianAndor.remainingHp).toBeLessThanOrEqual(0);
                expect(context.cassianAndor).toBeInZone('groundArena');

                context.player1.clickCard(context.cassianAndor);
                context.player1.clickCard(context.p2Base);

                // Player 2 claims initiative
                context.player2.claimInitiative();

                // Cassian is immediately defeated
                expect(context.cassianAndor).toBeInZone('base');
                expect(context.cassianAndor.exhausted).toBeTrue();
            });

            it('prevents Cassian from being defeated by having no remaining HP while you have the initiative (stat modifier)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cassian-andor#climb', deployed: true },
                        hasInitiative: true
                    },
                    player2: {
                        hand: ['perilous-position']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                // Player 2 plays Perilous Position on Cassian
                context.player2.clickCard(context.perilousPosition);
                context.player2.clickCard(context.cassianAndor);

                // Cassian should still be in play with 0 remaining HP due to initiative
                expect(context.cassianAndor.remainingHp).toBe(0);
                expect(context.cassianAndor).toBeInZone('groundArena');

                // Cassian is exhausted by Perilous Position, so just pass
                context.player1.passAction();

                // Player 2 claims initiative
                context.player2.claimInitiative();

                // Cassian is immediately defeated
                expect(context.cassianAndor).toBeInZone('base');
                expect(context.cassianAndor.exhausted).toBeTrue();
            });

            it('prevents Cassian from being defeated by enemy card abilities while you have the initiative', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cassian-andor#climb', deployed: true },
                        hasInitiative: true
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                // Player 2 plays Rivals' Fall on Cassian
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.cassianAndor);

                // Cassian should still be in play
                expect(context.cassianAndor).toBeInZone('groundArena');
            });

            it('Cassian can be defeated by card abilities when you do not have the initiative', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cassian-andor#climb', deployed: true }
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                // Player 2 plays Rivals' Fall on Cassian
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.cassianAndor);

                // Cassian is defeated
                expect(context.cassianAndor).toBeInZone('base');
                expect(context.cassianAndor.exhausted).toBeTrue();
            });
        });
    });
});