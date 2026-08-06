describe('Turning the Tide', function () {
    integration(function (contextRef) {
        describe('Turning the Tide\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['turning-the-tide'],
                        groundArena: ['battlefield-marine', 'wampa'],
                        spaceArena: ['red-three#unstoppable']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('should allow the player to deal damage to an enemy unit equal to the number of friendly units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.turningTheTide);

                // select any unit
                expect(context.player1).toBeAbleToSelectExactly([
                    context.atst,
                    context.greenSquadronAwing,
                    context.battlefieldMarine,
                    context.wampa,
                    context.redThreeUnstoppable
                ]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toHavePrompt('Choose a unit to deal 3 damage to');
                context.player1.clickCard(context.atst);

                // deal damage equal to the number of unit in its arena
                expect(context.atst.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to deal damage to a friendly unit equal to the number of friendly units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.turningTheTide);

                // select any unit
                expect(context.player1).toBeAbleToSelectExactly([
                    context.atst,
                    context.greenSquadronAwing,
                    context.battlefieldMarine,
                    context.wampa,
                    context.redThreeUnstoppable
                ]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toHavePrompt('Choose a unit to deal 3 damage to');
                context.player1.clickCard(context.wampa);

                // deal damage equal to the number of unit in its arena
                expect(context.wampa.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});