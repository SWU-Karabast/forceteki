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
                        groundArena: ['atst'],
                        hand: ['confiscate', 'bamboozle', 'vanquish'],
                        hasInitiative: true
                    }
                });
            });

            it('should give a shield to the attached unit when played as a pilot', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.lukeSkywalker);

                expect(context.player1).toHavePassAbilityPrompt('Move Luke Skywalker to the ground arena instead of being defeated');
                context.player1.clickPrompt('Trigger');

                expect(context.lukeSkywalker).toBeInZone('groundArena');
                expect(context.lukeSkywalker.exhausted).toBeTrue();
                expect(context.snowspeeder.isUpgraded()).toBeFalse();
            });
        });
    });
});