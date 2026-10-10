describe('Eighth Brother, Hunt Together', function() {
    integration(function(contextRef) {
        describe('Eighth Brother, Hunt Together\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ryloth-militia'],
                        groundArena: ['salacious-crumb#obnoxious-pet', 'eighth-brother#hunt-together'],
                        spaceArena: ['cartel-spacer'],
                        leader: 'asajj-ventress#unparalleled-adversary',
                        base: 'jedha-city',
                        hasForceToken: true
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['patrolling-vwing']
                    }
                });
            });

            it('should give an enemy unit +2/+2', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rylothMilitia);
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.salaciousCrumb, context.cartelSpacer, context.wampa, context.patrollingVwing, context.eighthBrother, context.rylothMilitia]);

                context.player1.clickCard(context.patrollingVwing);
                expect(context.patrollingVwing.getPower()).toBe(3);
            });

            it('should give a friendly unit +2/+2', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rylothMilitia);
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.salaciousCrumb, context.cartelSpacer, context.wampa, context.patrollingVwing, context.eighthBrother, context.rylothMilitia]);

                context.player1.clickCard(context.salaciousCrumb);
                expect(context.salaciousCrumb.getPower()).toBe(3);
            });

            it('should give itself +2/+2', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rylothMilitia);
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.salaciousCrumb, context.cartelSpacer, context.wampa, context.patrollingVwing, context.eighthBrother, context.rylothMilitia]);

                context.player1.clickCard(context.eighthBrother);
                expect(context.eighthBrother.getPower()).toBe(7);
            });

            it('should not be triggered as player decides not to use the Force', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rylothMilitia);
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Eighth Brother, Hunt Together\'s ability should not be triggered as player doesn\'t have the Force', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ryloth-militia'],
                    groundArena: ['eighth-brother#hunt-together'],
                    spaceArena: ['cartel-spacer']
                },
                player2: {
                    groundArena: ['wampa', 'salacious-crumb#obnoxious-pet'],
                    spaceArena: ['redemption#medical-frigate', 'patrolling-vwing']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rylothMilitia);
            expect(context.player2).toBeActivePlayer();
        });

        it('Eighth Brother, Hunt Together\'s ability should trigger when playing an opponent-owned unit from their discard pile', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['takedown'],
                    groundArena: ['eighth-brother#hunt-together'],
                    hasForceToken: true
                },
                player2: {
                    spaceArena: ['stolen-athauler']
                },
            });

            const { context } = contextRef;

            // Defeat the opponent's Stolen AT-Hauler so player1 may play it from player2's discard pile
            context.player1.clickCard(context.takedown);
            context.player1.clickCard(context.stolenAthauler);
            expect(context.stolenAthauler).toBeInZone('discard', context.player2);

            context.player2.passAction();

            context.player1.clickCard(context.stolenAthauler);
            expect(context.stolenAthauler).toBeInZone('spaceArena', context.player1);

            expect(context.player1).toHavePassAbilityPrompt('Use the Force to give a unit +2/+2');
            context.player1.clickPrompt('Trigger');
            expect(context.player1).toBeAbleToSelectExactly([context.eighthBrother, context.stolenAthauler]);
            context.player1.clickCard(context.stolenAthauler);

            expect(context.player1.hasTheForce).toBeFalse();
            expect(context.stolenAthauler.getPower()).toBe(6);
            expect(context.stolenAthauler.getHp()).toBe(7);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
