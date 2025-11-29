describe('Nemik\'s Manifesto', function() {
    integration(function(contextRef) {
        describe('Nemik\'s Manifesto\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nemiks-manifesto'],
                        groundArena: ['battlefield-marine', 'rebel-pathfinder', 'wampa'],
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['atst', 'death-star-stormtrooper'],
                        spaceArena: ['bright-hope#the-last-transport']
                    }
                });
            });

            it('should grant the rebel trait and deal damage to the enemy base for each other Rebel', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nemiksManifesto);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.deathStarStormtrooper, context.rebelPathfinder]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.hasSomeTrait('rebel')).toBeTrue();

                context.player2.clickPrompt('Pass');

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.atst);

                expect(context.wampa).toBeInZone('discard');
                expect(context.atst.damage).toBe(5);
                expect(context.p2Base.damage).toBe(2);

                expect(context.player2).toBeActivePlayer();
            });

            it('should work with No Glory', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nemiksManifesto);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.deathStarStormtrooper, context.rebelPathfinder]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.hasSomeTrait('rebel')).toBeTrue();

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('discard');
                expect(context.p1Base.damage).toBe(1);

                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});