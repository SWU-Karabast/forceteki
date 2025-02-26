describe('Planetary Bombardment', function() {
    integration(function(contextRef) {
        it('Planetary Bombardment\'s ability should deal 8 indirect damage to a player, or 12 if you control a Capital Ship', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['planetary-bombardment'],
                    spaceArena: ['avenger#hunting-star-destroyer'],
                },
                player2: {
                    groundArena: [{ card: 'wampa', upgrades: ['shield'] }, { card: 'boba-fett#disintegrator', upgrades: ['boba-fetts-armor'] }],
                    spaceArena: ['lurking-tie-phantom'],
                    leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true, damage: 4 },
                    hand: ['vanquish'],
                }
            });

            const { context } = contextRef;

            const reset = () => {
                context.player1.moveCard(context.planetaryBombardment, 'hand');
            };

            // Player 1 plays Planetary Bombardment and deals 12 indirect damage
            context.player1.clickCard(context.planetaryBombardment);
            expect(context.player1).toHavePrompt('Choose a player');

            context.player1.clickPrompt('Opponent');
            expect(context.player2).toHavePrompt('Distribute 12 indirect damage among targets');

            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.lurkingTiePhantom, context.bobaFett, context.chirrutImwe, context.p2Base]);
            expect(context.player2).not.toHaveChooseNoTargetButton();
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.wampa, 4],
                [context.p2Base, 3],
                [context.lurkingTiePhantom, 2],
                [context.bobaFett, 2],
                [context.chirrutImwe, 1],
            ]));

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(4);
            expect(context.wampa).toHaveExactUpgradeNames(['shield']);
            expect(context.p2Base.damage).toBe(3);
            expect(context.bobaFett.damage).toBe(2);
            expect(context.chirrutImwe.damage).toBe(5);
            expect(context.lurkingTiePhantom).toBeInZone('discard', context.player2);

            // Player 2 plays Vanquish and defeats Avenger
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.avenger);

            reset();

            // Player 1 plays Planetary Bombardment and deals 8 indirect damage
            context.player1.clickCard(context.planetaryBombardment);
            expect(context.player1).toHavePrompt('Choose a player');
            expect(context.p1Base.damage).toBe(0);

            context.player1.clickPrompt('You');

            expect(context.p1Base.damage).toBe(8);
        });
    });
});
