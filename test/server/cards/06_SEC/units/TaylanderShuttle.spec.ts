describe('Taylander Shuttle', function () {
    integration(function (contextRef) {
        describe('Taylander Shuttle\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        spaceArena: ['taylander-shuttle'],
                        hasInitiative: true,
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'crafty-smuggler'],
                    }
                });
            });

            it('should create a spy if we have initiative', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.taylanderShuttle);
                context.player1.clickCard(context.p2Base);

                const spy = context.player1.findCardsByName('spy');
                expect(spy.length).toBe(1);
                expect(spy[0]).toBeInZone('groundArena');
                expect(spy[0].exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should not create a spy if we do not have initiative', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);
                context.player2.claimInitiative();

                context.player1.clickCard(context.taylanderShuttle);
                context.player1.clickCard(context.p2Base);

                const spy = context.player1.findCardsByName('spy');
                expect(spy.length).toBe(0);

                expect(context.player1).toHavePrompt('Choose an action');
            });
        });
    });
});