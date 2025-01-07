describe('First Light, Headquarters of the Crimson Dawn', function() {
    integration(function(contextRef) {
        describe('First Light\'s Smuggle ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'qira#i-alone-survived',
                        groundArena: ['wampa'],
                        resources: ['first-light#headquarters-of-the-crimson-dawn', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst']
                    },
                    player2: {
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should require dealing 4 damage to a friendly unit as a cost', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.firstLight);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.firstLight).toBeInZone('spaceArena');
                expect(context.wampa.damage).toBe(4);
                expect(context.wampa.getPower()).toBe(8);
            });
        });
    });
});
