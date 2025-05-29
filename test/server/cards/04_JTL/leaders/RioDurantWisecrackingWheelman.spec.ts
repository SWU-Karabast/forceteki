
describe('Rio Durant, Wisecracking Wheelman', function() {
    integration(function(contextRef) {
        beforeEach(function() {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'rio-durant#wisecracking-wheelman',
                    groundArena: ['atst', 'crafty-smuggler'],
                    spaceArena: ['seventh-fleet-defender', 'corellian-freighter'],
                    resources: 10
                },
                player2: {
                    groundArena: ['patrolling-aat'],
                    spaceArena: ['system-patrol-craft']
                }
            });
        });

        it('Rio Durant\'s leader side ability should attack with a space unit and give it +1/0 and Saboteur', function() {
            const { context } = contextRef;

            context.player1.clickCard(context.rioDurant);
            context.player1.clickPrompt('Attack with a space unit. It gets +1/+0 and gains Saboteur for this attack');

            expect(context.player1).toBeAbleToSelectExactly([context.seventhFleetDefender, context.corellianFreighter]);

            context.player1.clickCard(context.seventhFleetDefender);

            // Able to attack base instead of the Sentinel because leader gives Saboteur and +1/0
            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.p2Base]);

            context.player1.clickCard(context.p2Base);

            expect(context.player1.readyResourceCount).toBe(9);
            expect(context.p2Base.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });

        it('Rio Durant\'s pilot ability should give a vehicle unit Saboteur but not +1/0 when it is not a Transport', function() {
            const { context } = contextRef;

            context.player1.clickCard(context.rioDurant);
            context.player1.clickPrompt('Deploy Rio Durant as a Pilot');

            expect(context.player1).toBeAbleToSelectExactly([context.seventhFleetDefender, context.corellianFreighter, context.atst]);

            context.player1.clickCard(context.seventhFleetDefender);

            // Should gain Saboteur but not +1/0 because it is not a Transport
            expect(context.seventhFleetDefender.hasSomeKeyword('saboteur')).toBe(true);
            // 3 power from unit + 3 power from leader pilot
            expect(context.seventhFleetDefender.getPower()).toBe(6);
            expect(context.seventhFleetDefender.getHp()).toBe(7);

            context.player2.passAction();
            context.player1.clickCard(context.seventhFleetDefender);

            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.p2Base]);

            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(6);
            expect(context.player2).toBeActivePlayer();
        });

        it('Rio Durant\'s pilot ability should give a vehicle unit Saboteur and +1/0 for being a Transport', function() {
            const { context } = contextRef;

            context.player1.clickCard(context.rioDurant);
            context.player1.clickPrompt('Deploy Rio Durant as a Pilot');

            expect(context.player1).toBeAbleToSelectExactly([context.seventhFleetDefender, context.corellianFreighter, context.atst]);

            context.player1.clickCard(context.corellianFreighter);

            // Should gain Saboteur and +1/0 because it is a Transport
            expect(context.corellianFreighter.hasSomeKeyword('saboteur')).toBe(true);
            // 4 power from unit + 3 power from leader pilot + 1 power for being a Transport
            expect(context.corellianFreighter.getPower()).toBe(8);
            expect(context.corellianFreighter.getHp()).toBe(9);

            context.player2.passAction();
            context.player1.clickCard(context.corellianFreighter);

            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.p2Base]);

            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(8);
            expect(context.player2).toBeActivePlayer();
        });
    });
});