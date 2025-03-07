describe('Lightspeed Assault', function() {
    integration(function(contextRef) {
        it('Lightspeed Assault should defeat a friendly space unit and deal its damage to an enemy space unit, triggering indirect damage', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lightspeed-assault'],
                    spaceArena: ['avenger#hunting-star-destroyer', 'concord-dawn-interceptors']
                },
                player2: {
                    spaceArena: ['black-sun-starfighter', 'imperial-interceptor', 'lurking-tie-phantom', { card: 'cartel-spacer', upgrades: ['shield'] }],
                }
            });

            const { context } = contextRef;

            // Sacrifice Concord Dawn
            context.player1.clickCard(context.lightspeedAssault);
            expect(context.player1).toBeAbleToSelectExactly([context.avenger, context.concordDawnInterceptors]);
            context.player1.clickCard(context.concordDawnInterceptors);
            expect(context.concordDawnInterceptors).toBeInZone('discard');

            // Deal Damage to Black Sun
            expect(context.player1).toBeAbleToSelectExactly([context.blackSunStarfighter, context.imperialInterceptor, context.lurkingTiePhantom, context.cartelSpacer]);
            context.player1.clickCard(context.blackSunStarfighter);
            expect(context.blackSunStarfighter.damage).toBe(1);

            expect(context.player2).toHavePrompt('Distribute 3 indirect damage among targets');

            expect(context.player2).toBeAbleToSelectExactly([context.blackSunStarfighter, context.imperialInterceptor, context.lurkingTiePhantom, context.cartelSpacer, context.p2Base]);
            expect(context.player2).not.toHaveChooseNoTargetButton();
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.blackSunStarfighter, 0],
                [context.imperialInterceptor, 1],
                [context.lurkingTiePhantom, 0],
                [context.cartelSpacer, 2],
                [context.p2Base, 0],
            ]));
            expect(context.player2).toBeActivePlayer();
        });

        it('Lightspeed Assault should do nothing if there is no friendly space unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lightspeed-assault']
                },
                player2: {
                    spaceArena: [{ card: 'cartel-spacer', upgrades: ['shield'] }],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lightspeedAssault);
            expect(context.player2).toBeActivePlayer();
        });

        it('Lightspeed Assault should defeat a friendly space unit and deal its damage to an enemy Lurking TIE, and still deal indirect damage', async function() {
            pending('This test is failing because Lurking TIE is not being treated as a replacement effect');
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lightspeed-assault'],
                    spaceArena: ['concord-dawn-interceptors']
                },
                player2: {
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            // Sacrifice Concord Dawn
            context.player1.clickCard(context.lightspeedAssault);
            context.player1.clickCard(context.concordDawnInterceptors);

            // Deal Damage to Lurking TIE
            context.player1.clickCard(context.lurkingTiePhantom);
            expect(context.lurkingTiePhantom.damage).toBe(0);

            expect(context.player2).toHavePrompt('Distribute 2 indirect damage among targets');

            expect(context.player2).toBeAbleToSelectExactly([context.lurkingTiePhantom, context.p2Base]);
            expect(context.player2).not.toHaveChooseNoTargetButton();
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.lurkingTiePhantom, 1],
                [context.p2Base, 1],
            ]));
            expect(context.player2).toBeActivePlayer();
        });

        it('Lightspeed Assault should defeat a friendly space unit and deal its damage to an enemy unit with a Shield, and still deal indirect damage', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lightspeed-assault'],
                    spaceArena: ['concord-dawn-interceptors']
                },
                player2: {
                    spaceArena: [{ card: 'cartel-spacer', upgrades: ['shield'] }],
                }
            });

            const { context } = contextRef;

            // Sacrifice Concord Dawn
            context.player1.clickCard(context.lightspeedAssault);
            context.player1.clickCard(context.concordDawnInterceptors);

            // Deal Damage to Lurking TIE
            context.player1.clickCard(context.cartelSpacer);
            expect(context.cartelSpacer.damage).toBe(0);

            expect(context.player2).toHavePrompt('Distribute 2 indirect damage among targets');

            expect(context.player2).toBeAbleToSelectExactly([context.cartelSpacer, context.p2Base]);
            expect(context.player2).not.toHaveChooseNoTargetButton();
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.cartelSpacer, 1],
                [context.p2Base, 1],
            ]));
            expect(context.player2).toBeActivePlayer();
        });
    });
});
