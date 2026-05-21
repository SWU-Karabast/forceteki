describe('Incinerator Trooper', function() {
    integration(function(contextRef) {
        describe('Incinerator Trooper\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['incinerator-trooper'],
                    },
                    player2: {
                        groundArena: ['jedha-agitator', 'wampa']

                    }
                });
            });

            it('should defeat enemy ground unit before taking damage.', function () {
                const { context } = contextRef;
                // Case 1 it defeats the ground unit before taking damage
                context.player1.clickCard(context.incineratorTrooper);
                context.player1.clickCard(context.jedhaAgitator);

                // check board state
                expect(context.incineratorTrooper.damage).toBe(0);
                expect(context.jedhaAgitator).toBeInZone('discard');

                // Case 2 attacking wampa should defeat incinerator-trooper and give 2 damage to wampa
                context.player2.passAction();
                context.readyCard(context.incineratorTrooper);
                context.player1.clickCard(context.incineratorTrooper);
                context.player1.clickCard(context.wampa);

                // check board state
                expect(context.incineratorTrooper).toBeInZone('discard');
                expect(context.wampa.damage).toBe(2);
            });

            it('does not deal damage first when defending.', function () {
                const { context } = contextRef;

                context.player1.passAction();

                // Jedha Agitator attacks Incinerator Trooper
                context.player2.clickCard(context.jedhaAgitator);
                context.player2.clickCard(context.incineratorTrooper);

                // Both units are defeated, since damage was dealt simultaneously
                expect(context.incineratorTrooper).toBeInZone('discard');
                expect(context.jedhaAgitator).toBeInZone('discard');
            });
        });
    });
});