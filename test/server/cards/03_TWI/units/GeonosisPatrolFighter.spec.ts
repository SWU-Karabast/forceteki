describe('Geonosis Patrol Fighter', function() {
    integration(function(contextRef) {
        it('Geonosis Patrol Fighter\'s when played ability should return a non-leader unit that costs 3 or less to its owner\'s hand', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['geonosis-patrol-fighter'],
                    groundArena: ['captain-typho#protecting-the-senator', 'shaak-ti#unity-wins-wars', 'asajj-ventress#count-dookus-assassin', 'separatist-commando']
                },
                player2: {
                    groundArena: ['clone-heavy-gunner'],
                    spaceArena: ['restored-arc170', 'home-one#alliance-flagship'],
                    hand: ['waylay']
                }
            });

            const { context } = contextRef;

            const reset = () => {
                context.player1.moveCard(context.geonosisPatrolFighter, 'hand');
                context.player2.passAction();
            };

            // Returns Ground unit that costs 3 or less
            context.player1.clickCard(context.geonosisPatrolFighter);
            context.player1.clickPrompt('Play Geonosis Patrol Fighter');

            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.cloneHeavyGunner, context.restoredArc170, context.captainTyphoProtectingTheSenator, context.separatistCommando]);
            context.player1.clickCard(context.cloneHeavyGunner);
            expect(context.cloneHeavyGunner).toBeInZone('hand');

            // Returns own unit
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.geonosisPatrolFighter);
            context.player1.clickCard(context.geonosisPatrolFighter);
            context.player1.clickPrompt('Play Geonosis Patrol Fighter');
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.restoredArc170, context.captainTyphoProtectingTheSenator, context.separatistCommando]);

            context.player1.clickCard(context.captainTyphoProtectingTheSenator);
            expect(context.captainTyphoProtectingTheSenator).toBeInZone('hand');

            reset();

            // Ability triggers using exploit, exploited units should not be targetable
            context.player1.clickCard(context.geonosisPatrolFighter);
            expect(context.player1).toBeAbleToSelectExactly([context.asajjVentress, context.shaakTi, context.separatistCommando]);
            expect(context.player1).not.toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.asajjVentress);
            context.player1.clickCard(context.separatistCommando);
            context.player1.clickPrompt('Done');

            // Validating ability is optional
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.restoredArc170]);
            context.player1.clickPrompt('Pass');
            expect(context.restoredArc170).toBeInZone('spaceArena');
        });
    });
});
