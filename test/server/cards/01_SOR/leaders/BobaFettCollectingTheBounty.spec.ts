describe('Boba Fett, Collecting the Bounty', function() {
    integration(function(contextRef) {
        describe('Boba Fett\'s leader ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rivals-fall', 'waylay', 'no-glory-only-results', 'atst'],
                        groundArena: ['death-star-stormtrooper'],
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'dagobah-swamp',
                        resources: 6,
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['viper-probe-droid', 'cell-block-guard', 'wampa'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    },
                });
            });

            it('should ready a resource when an enemy unit is defeated', function() {
                const { context } = contextRef;

                // Case 1 - when defeating an enemy unit
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.viperProbeDroid);

                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.bobaFett.exhausted).toBeTrue();
            });

            it('should ready a resource when an enemy unit returns to owner\'s hand', function() {
                const { context } = contextRef;

                // Case 2 - when returning an enemy unit to hand
                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.wampa);

                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.bobaFett.exhausted).toBeTrue();
            });

            it('should ready a resource when a leader enemy unit is defeated', function() {
                const { context } = contextRef;

                // Case 3 - when defeating an enemy leader unit
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.lukeSkywalker);

                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.bobaFett.exhausted).toBeTrue();
            });

            it('should not ready a resource when an enemy unit leaves play when there is exhausted resources', function() {
                const { context } = contextRef;

                // Case 4 - when there are no exhausted resources
                context.player1.clickCard(context.deathStarStormtrooper);
                context.player1.clickCard(context.cellBlockGuard);

                expect(context.cellBlockGuard).toBeInZone('discard');
                expect(context.bobaFett.exhausted).toBeFalse();
            });

            it('should not ready a resource when a friendly unit is defeated', function() {
                const { context } = contextRef;

                // Case 5 - when a friendly unit leaves play
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.bobaFett.exhausted).toBeFalse();
            });

            it('should not ready a resource when an enemy unit is defeated with No Glory Only Results', function() {
                const { context } = contextRef;

                const noGloryOnlyResults = context.player1.findCardByName('no-glory-only-results', 'hand');

                context.player1.clickCard(noGloryOnlyResults);
                context.player1.clickCard(context.wampa);

                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.bobaFett.exhausted).toBeFalse();
            });

            it('should ready a resource when a friendly unit is defeated with No Glory Only Results', function() {
                const { context } = contextRef;

                const noGloryOnlyResults = context.player2.findCardByName('no-glory-only-results', 'hand');

                context.player1.clickCard(context.atst);

                context.player2.clickCard(noGloryOnlyResults);
                context.player2.clickCard(context.atst);

                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.bobaFett.exhausted).toBeTrue();
            });
        });

        describe('Boba Fett\'s leader unit ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['atst', 'no-glory-only-results'],
                        leader: { card: 'boba-fett#collecting-the-bounty', deployed: true },
                        base: 'capital-city',
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['battlefield-marine'],
                    },
                });
            });

            it('should ready 2 resources when Boba Fett completes an attack if an enemy unit left play this turn', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.atst);
                context.player2.passAction();
                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should not ready resources if Boba Fett dies while attacking, even if an enemy unit left play this turn', function() {
                const { context } = contextRef;

                context.setDamage(context.bobaFett, 4);
                context.player1.clickCard(context.atst);
                context.player2.passAction();
                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1.exhaustedResourceCount).toBe(6);
            });

            it('should not ready resources if an enemy unit was defeated by No Glory Only Results', function() {
                const { context } = contextRef;

                const noGloryOnlyResults = context.player1.findCardByName('no-glory-only-results', 'hand');

                context.player1.clickCard(noGloryOnlyResults);
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();
                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.exhaustedResourceCount).toBe(5);
            });

            it('should ready resources if a friendly unit was defeated by No Glory Only Results', function() {
                const { context } = contextRef;

                const noGloryOnlyResults = context.player2.findCardByName('no-glory-only-results', 'hand');

                context.player1.clickCard(context.atst);
                context.player2.clickCard(noGloryOnlyResults);
                context.player2.clickCard(context.atst);
                context.player1.clickCard(context.bobaFett);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.exhaustedResourceCount).toBe(4);
            });
        });
    });
});
