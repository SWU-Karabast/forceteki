describe('Turbolaser Salvo', function() {
    integration(function(contextRef) {
        it('Turbolaser Salvo should choose an arena and then a friendly space unit to deal damage to all enemy units in the chosen arena', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['turbolaser-salvo'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['avenger#hunting-star-destroyer', 'concord-dawn-interceptors']
                },
                player2: {
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

            // Ensure damage was dealt to all enemy ships (except Lurking TIE)
            expect(context.blackSunStarfighter).toBeInZone('discard');
            expect(context.imperialInterceptor).toBeInZone('discard');
            expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
            expect(context.cartelSpacer).toBeInZone('spaceArena');
            expect(context.cartelSpacer.upgrades.length).toBe(0);
        });

        it('Turbolaser Salvo should choose an Arena and then do nothing if the player controls no Space units', async function() {
            pending('TODO: Open question on prompt auto-resolve');
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['turbolaser-salvo'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    spaceArena: ['black-sun-starfighter', 'imperial-interceptor', 'lurking-tie-phantom', { card: 'cartel-spacer', upgrades: ['shield'] }],
                }
            });

            const { context } = contextRef;

            // Choose Arena
            context.player1.clickCard(context.turbolaserSalvo);
            expect(context.player1).toHaveEnabledPromptButtons(['Ground', 'Space']);
            context.player1.clickPrompt('Space');

            expect(context.player2).toBeActivePlayer();
        });

        it('Turbolaser Salvo should choose not deal damage to friendly units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['turbolaser-salvo'],
                    spaceArena: ['avenger#hunting-star-destroyer', 'concord-dawn-interceptors']
                },
                player2: {
                    spaceArena: ['black-sun-starfighter'],
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
            expect(context.concordDawnInterceptors).toBeInZone('spaceArena');
        });

        it('Turbolaser Salvo should choose not deal damage to units in the non-chosen arena', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['turbolaser-salvo'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['avenger#hunting-star-destroyer']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['black-sun-starfighter'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.turbolaserSalvo);
            expect(context.player1).toHaveEnabledPromptButtons(['Ground', 'Space']);
            context.player1.clickPrompt('Space');
            context.player1.clickCard(context.avenger);

            expect(context.blackSunStarfighter).toBeInZone('discard');
            expect(context.wampa).toBeInZone('groundArena');
            expect(context.battlefieldMarine).toBeInZone('groundArena');
        });
    });
});
