describe('In the Heat of Battle', () => {
    integration(function(contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                    hand: [
                        'in-the-heat-of-battle',
                        'precision-fire',
                        'infiltrators-skill'
                    ],
                    groundArena: [
                        'battlefield-marine',
                        'rebel-pathfinder'
                    ],
                    spaceArena: [
                        'orbiting-kwing',
                        'hwk290-freighter'
                    ]
                },
                player2: {
                    hand: [
                        'wampa',
                        'specforce-soldier'
                    ],
                    groundArena: [
                        'consular-security-force',
                        'echo-base-defender'
                    ],
                    spaceArena: [
                        'alliance-xwing',
                        'system-patrol-craft'
                    ]
                }
            });
        });

        it('Grants all units Sentinel and removes Saboteur for the phase', function() {
            const { context } = contextRef;

            // Play In the Heat of Battle
            context.player1.clickCard(context.inTheHeatOfBattle);

            // Consular Security Force can only attack the ground units because they are Sentinel
            context.player2.clickCard(context.consularSecurityForce);
            expect(context.player2).toBeAbleToSelectExactly([
                context.battlefieldMarine,
                context.rebelPathfinder
            ]);
            context.player2.clickPrompt('Cancel');

            // Alliance X-Wing can only attack the space units because they are Sentinel
            context.player2.clickCard(context.allianceXwing);
            expect(context.player2).toBeAbleToSelectExactly([
                context.orbitingKwing,
                context.hwk290Freighter
            ]);
            context.player2.clickCard(context.hwk290Freighter);

            // Rebel Pathfinder can only attack the ground units because they are Sentinel and it lost Saboteur
            context.player1.clickCard(context.rebelPathfinder);
            expect(context.player1).toBeAbleToSelectExactly([
                context.consularSecurityForce,
                context.echoBaseDefender
            ]);
            context.player1.clickPrompt('Cancel');

            // Orbiting K-Wing can only attack the space units because they are Sentinel and it lost Saboteur
            context.player1.clickCard(context.orbitingKwing);
            expect(context.player1).toBeAbleToSelectExactly([
                context.allianceXwing,
                context.systemPatrolCraft
            ]);
            context.player1.clickCard(context.systemPatrolCraft);

            // After the phase, the effect has expired
            context.moveToNextActionPhase();

            context.player1.clickCard(context.rebelPathfinder);
            expect(context.player1).toBeAbleToSelectExactly([
                context.consularSecurityForce,
                context.echoBaseDefender,
                context.p2Base
            ]);
            context.player1.clickCard(context.p2Base);

            context.player2.clickCard(context.allianceXwing);
            expect(context.player2).toBeAbleToSelectExactly([
                context.orbitingKwing,
                context.hwk290Freighter,
                context.p1Base
            ]);
            context.player2.clickCard(context.p1Base);
        });

        it('Affected units cannot regain Saboteur for the phase', function() {
            const { context } = contextRef;

            // Play In the Heat of Battle
            context.player1.clickCard(context.inTheHeatOfBattle);
            context.player2.passAction();

            // Play Infilitrator's Skill on Battlefield Marine
            context.player1.clickCard(context.infiltratorsSkill);
            context.player1.clickCard(context.battlefieldMarine);
            context.player2.passAction();

            // Attack with Battlefield Marine, it does not have Saboteur
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toBeAbleToSelectExactly([
                context.consularSecurityForce,
                context.echoBaseDefender
            ]);
            context.player1.clickCard(context.consularSecurityForce);
            context.player2.passAction();

            // Play Precision Fire to attack with Rebel Pathfinder
            context.player1.clickCard(context.precisionFire);
            context.player1.clickCard(context.rebelPathfinder);

            // It does not have Saboteur for the attack
            expect(context.player1).toBeAbleToSelectExactly([
                context.consularSecurityForce,
                context.echoBaseDefender
            ]);
            context.player1.clickCard(context.consularSecurityForce);
        });

        it('Does not affect units that enter play after the event is played', function() {
            const { context } = contextRef;

            // Play In the Heat of Battle
            context.player1.clickCard(context.inTheHeatOfBattle);

            // Player 2 plays Wampa
            context.player2.clickCard('wampa');

            // Wampa cannot be targeted because it does not have Sentinel
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toBeAbleToSelectExactly([
                context.consularSecurityForce,
                context.echoBaseDefender
            ]);
            context.player1.clickCard(context.consularSecurityForce);
        });

        it('Affected units can lose Sentinel later in the phase', function() {
            const { context } = contextRef;

            // Play In the Heat of Battle
            context.player1.clickCard(context.inTheHeatOfBattle);

            // Player 2 plays SpecForce Soldier and removes Sentinel from Alliance X-Wing
            context.player2.clickCard('specforce-soldier');
            context.player2.clickCard(context.allianceXwing);

            // Use Kazuda's ability to make Battlefield Marine lose all abilities
            context.player1.clickCard(context.kazudaXiono);
            context.player1.clickPrompt('Select a friendly unit');
            context.player1.clickCard(context.battlefieldMarine);

            // Attack with Oribiting K-Wing, it cannot target Alliance X-Wing
            context.player1.clickCard(context.orbitingKwing);
            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft]);
            context.player1.clickCard(context.systemPatrolCraft);

            // Attack with Consular Security Force, it cannot target Battlefield Marine
            context.player2.clickCard(context.consularSecurityForce);
            expect(context.player2).toBeAbleToSelectExactly([context.rebelPathfinder]);
            context.player2.clickCard(context.rebelPathfinder);
        });
    });
});
