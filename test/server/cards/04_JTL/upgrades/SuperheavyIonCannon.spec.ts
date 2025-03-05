describe('Superheavy Ion Cannon', function () {
    integration(function (contextRef) {
        it('Superheavy Ion Cannon\'s attached unit gain on Attack ability\'s may exhaust an enemy non-leader unit and deal indirect damage equal to its power to controller', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['superheavy-ion-cannon'],
                    groundArena: ['wampa', 'low-altitude-gunship'],
                    spaceArena: ['home-one#on-my-mark', 'green-squadron-awing'],
                },
                player2: {
                    groundArena: ['atst'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.superheavyIonCannon);

            // can only be attached to capital ship or transport
            expect(context.player1).toBeAbleToSelectExactly([context.homeOne, context.lowAltitudeGunship]);
            context.player1.clickCard(context.homeOne);
            context.player2.passAction();

            context.player1.clickCard(context.homeOne);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toBeAbleToSelectExactly([context.atst]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.atst);
            expect(context.atst.exhausted).toBeTrue();

            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.p2Base, 6],
            ]));

            expect(context.player2).toBeActivePlayer();
        });
    });
});
