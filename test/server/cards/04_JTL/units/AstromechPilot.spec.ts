describe('Astromech Pilot', function () {
    integration(function (contextRef) {
        describe('Astromech Pilot\'s piloting ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['astromech-pilot'],
                        groundArena: [{ card: 'escort-skiff', damage: 3 }],
                        spaceArena: [{ card: 'green-squadron-awing', damage: 2 }]
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 3 }],
                    }
                });
            });

            it('should heal 2 damage from a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.astromechPilot);
                context.player1.clickPrompt('Play Astromech Pilot with Piloting');
                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.player1).toBeAbleToSelectExactly([context.escortSkiff, context.greenSquadronAwing, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.escortSkiff);

                expect(context.player2).toBeActivePlayer();
                expect(context.escortSkiff.damage).toBe(1);
            });

            it('should do nothing if not played as a pilot', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.astromechPilot);
                context.player1.clickPrompt('Play Astromech Pilot');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
