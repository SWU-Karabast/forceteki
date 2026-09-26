describe('Awakened Exogorth', function() {
    integration(function(contextRef) {
        it('should give the defending unit -3/-0 while attacking', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['awakened-exogorth']
                },
                player2: {
                    spaceArena: ['adelphi-patrol-wing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.awakenedExogorth);
            context.player1.clickCard(context.adelphiPatrolWing);

            // Adelphi Patrol Wing (4/6) gets -3/-0, so it deals only 1 damage back
            expect(context.awakenedExogorth.damage).toBe(1);
            expect(context.adelphiPatrolWing).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should reduce the defending unit\'s power to 0 when its power is 3 or less', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['awakened-exogorth']
                },
                player2: {
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.awakenedExogorth);
            context.player1.clickCard(context.cartelSpacer);

            // Cartel Spacer (2/3) is reduced to -1 power and deals no damage
            expect(context.awakenedExogorth.damage).toBe(0);
            expect(context.cartelSpacer).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should restore the defending unit\'s power after the attack ends', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['awakened-exogorth']
                },
                player2: {
                    spaceArena: ['acclamator-assault-ship']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.awakenedExogorth);
            context.player1.clickCard(context.acclamatorAssaultShip);

            // Acclamator Assault Ship (5/8) gets -3/-0 during the attack, dealing 2 damage,
            // and survives with 7 damage. Its power returns to 5 after combat.
            expect(context.awakenedExogorth.damage).toBe(2);
            expect(context.acclamatorAssaultShip.damage).toBe(7);
            expect(context.acclamatorAssaultShip.getPower()).toBe(5);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not debuff the attacker while Awakened Exogorth is defending', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['awakened-exogorth']
                },
                player2: {
                    spaceArena: ['cartel-spacer'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.cartelSpacer);
            context.player2.clickCard(context.awakenedExogorth);

            // Cartel Spacer deals its full 2 damage since Exogorth is not attacking
            expect(context.awakenedExogorth.damage).toBe(2);
            expect(context.cartelSpacer).toBeInZone('discard', context.player2);
            expect(context.player1).toBeActivePlayer();
        });

        it('should not debuff the defender when another friendly unit attacks', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['awakened-exogorth', 'alliance-xwing']
                },
                player2: {
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.allianceXwing);
            context.player1.clickCard(context.cartelSpacer);

            // Cartel Spacer keeps its 2 power because Exogorth is not the attacker
            expect(context.allianceXwing.damage).toBe(2);
            expect(context.cartelSpacer.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
