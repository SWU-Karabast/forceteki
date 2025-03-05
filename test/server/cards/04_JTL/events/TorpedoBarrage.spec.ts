describe('Torpedo Barrage', function() {
    integration(function(contextRef) {
        it('Torpedo Barrage\'s ability should deal 5 indirect damage to a player', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['torpedo-barrage'],
                },
                player2: {
                    groundArena: [{ card: 'wampa', upgrades: ['shield'] }, { card: 'boba-fett#disintegrator', upgrades: ['boba-fetts-armor'] }],
                    spaceArena: ['lurking-tie-phantom'],
                    hand: ['vanquish'],
                }
            });

            const { context } = contextRef;

            const reset = () => {
                context.player1.moveCard(context.planetaryBombardment, 'hand');
            };

            // Player 1 plays Torpedo Barrage and deals 5 indirect damage
            context.player1.clickCard(context.torpedoBarrage);
            expect(context.player1).toHavePrompt('Select one');

            context.player1.clickPrompt('Opponent');
            expect(context.player2).toHavePrompt('Distribute 5 indirect damage among targets');

            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.lurkingTiePhantom, context.bobaFett, context.p2Base]);
            expect(context.player2).not.toHaveChooseNoTargetButton();
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.p2Base, 4],
                [context.lurkingTiePhantom, 1],
            ]));

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(4);
            expect(context.lurkingTiePhantom.damage).toBe(1);
        });
    });
});
