describe('Luke Skywalker, You Still With Me?', function() {
    integration(function(contextRef) {
        describe('Luke\'s piloting ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'snowspeeder', upgrades: ['luke-skywalker#you-still-with-me'] }]
                    },
                    player2: {
                        groundArena: ['blizzard-assault-atat'],
                        hand: ['confiscate', 'bamboozle', 'rivals-fall', 'superlaser-blast'],
                        hasInitiative: true
                    }
                });
            });

            it('should allow the controller to detach him instead of being defeated', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.lukeSkywalker);

                expect(context.player1).toHavePassAbilityPrompt('Move Luke Skywalker to the ground arena instead of being defeated');
                context.player1.clickPrompt('Trigger');

                expect(context.lukeSkywalker).toBeInZone('groundArena');
                expect(context.lukeSkywalker.exhausted).toBeTrue();
                expect(context.snowspeeder.isUpgraded()).toBeFalse();
            });

            it('should prevent him from being defeated when the attached unit is defeated in combat', function() {
                const { context } = contextRef;

                context.player2.passAction();

                context.player1.clickCard(context.snowspeeder);
                context.player1.clickCard(context.blizzardAssaultAtat);
                context.player1.clickCard(context.blizzardAssaultAtat); // Snowspeeder ability

                expect(context.player1).toHavePassAbilityPrompt('Move Luke Skywalker to the ground arena instead of being defeated');
                context.player1.clickPrompt('Trigger');

                expect(context.lukeSkywalker).toBeInZone('groundArena');
                expect(context.lukeSkywalker.exhausted).toBeTrue();
                expect(context.snowspeeder).toBeInZone('discard');
            });

            it('should prevent him from being defeated when the attached unit is defeated by an ability', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.snowspeeder);

                expect(context.player1).toHavePassAbilityPrompt('Move Luke Skywalker to the ground arena instead of being defeated');
                context.player1.clickPrompt('Trigger');

                expect(context.lukeSkywalker).toBeInZone('groundArena');
                expect(context.lukeSkywalker.exhausted).toBeTrue();
                expect(context.snowspeeder).toBeInZone('discard');
            });

            it('should prevent him from being defeated by a defeat ability targeting all units', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.superlaserBlast);

                expect(context.player1).toHavePassAbilityPrompt('Move Luke Skywalker to the ground arena instead of being defeated');
                context.player1.clickPrompt('Trigger');

                expect(context.lukeSkywalker).toBeInZone('groundArena');
                expect(context.lukeSkywalker.exhausted).toBeTrue();
                expect(context.snowspeeder).toBeInZone('discard');
            });

            it('should not prevent him from being directly returned to hand', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.bamboozle);
                context.player2.clickCard(context.snowspeeder);

                expect(context.lukeSkywalker).toBeInZone('hand');
                expect(context.player1).toBeActivePlayer();
            });

            it('should prevent him from being defeated as a unit after detaching', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.snowspeeder);

                expect(context.player1).toHavePassAbilityPrompt('Move Luke Skywalker to the ground arena instead of being defeated');
                context.player1.clickPrompt('Trigger');

                context.player1.passAction();

                // SQUISH
                context.player2.clickCard(context.blizzardAssaultAtat);
                context.player2.clickCard(context.lukeSkywalker);

                expect(context.lukeSkywalker).toBeInZone('discard');
            });
        });
    });
});