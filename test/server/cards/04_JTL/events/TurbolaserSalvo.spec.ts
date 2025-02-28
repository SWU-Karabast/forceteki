describe('Turbolaser Salvo', function() {
    integration(function(contextRef) {
        it('Turbolaser Salvo chooses Space arena and a friendly Space unit and deals the unit\'s damage to each enemy unit in that arena', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['turbolaser-salvo'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['avenger#hunting-star-destroyer', 'concord-dawn-interceptors']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['black-sun-starfighter', 'imperial-interceptor', 'lurking-tie-phantom', { card: 'cartel-spacer', upgrades: ['shield'] }],
                }
            });

            const { context } = contextRef;

            // Choose Arena
            context.player1.clickCard(context.turbolaserSalvo);
            expect(context.player1).toHaveEnabledPromptButtons(['Ground', 'Space']);
            context.player1.clickPrompt('Space');

            // Choose friendly space unit
            expect(context.player1).toBeAbleToSelectExactly([context.avenger, context.concordDawnInterceptors]);
            context.player1.clickCard(context.avenger);

            expect(context.blackSunStarfighter).toBeInZone('discard');
            expect(context.imperialInterceptor).toBeInZone('discard');
            expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
            expect(context.cartelSpacer).toBeInZone('spaceArena');
            expect(context.cartelSpacer.upgrades.length).toBe(0);
        });
    });
});
