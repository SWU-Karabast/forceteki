describe('Rodian Bondsman', function () {
    integration(function (contextRef) {
        describe('Rodian Bondsman\'s When Defeated ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        hand: ['vanquish'],
                        hasInitiative: true,
                    },
                    player2: {
                        groundArena: ['rodian-bondsman'],
                        credits: 2
                    },
                });
            });

            it('should create a Credit token for each player when defeated by a unit', function () {
                const { context } = contextRef;

                expect(context.player1.credits).toBe(0);
                expect(context.player2.credits).toBe(2);

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.rodianBondsman);

                // Both players should have received a Credit token
                expect(context.player1.credits).toBe(1);
                expect(context.player2.credits).toBe(3);

                // Rodian Bondsman should be in discard
                expect(context.rodianBondsman).toBeInZone('discard', context.player2);
            });

            it('should create a Credit token for each player when defeated by an event', function () {
                const { context } = contextRef;

                expect(context.player1.credits).toBe(0);
                expect(context.player2.credits).toBe(2);

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.rodianBondsman);

                // Both players should have received a Credit token
                expect(context.player1.credits).toBe(1);
                expect(context.player2.credits).toBe(3);

                // Rodian Bondsman should be in discard
                expect(context.rodianBondsman).toBeInZone('discard', context.player2);
            });
        });
    });
});