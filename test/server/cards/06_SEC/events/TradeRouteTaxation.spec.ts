describe('Trade Route Taxation', function () {
    integration(function (contextRef) {
        it('Trade Route Taxation\'s ability should prevent opponent to play event for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['trade-route-taxation', 'daring-raid'],
                    groundArena: ['wampa', 'atst']
                },
                player2: {
                    hand: ['awing', 'resupply', 'protector'],
                    groundArena: ['battlefield-marine'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.tradeRouteTaxation);

            expect(context.player2).toBeAbleToSelectAllOf([context.awing, context.protector]);
            expect(context.player2).not.toBeAbleToSelectAllOf([context.resupply]);

            context.player2.passAction();

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(2);

            context.moveToNextActionPhase();

            context.player1.passAction();
            context.player2.clickCard(context.resupply);
        });

        it('Trade Route Taxation\'s ability should not prevent opponent to play event for this phase as we do not control more unit than him', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['trade-route-taxation'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    hand: ['awing', 'resupply', 'protector'],
                    groundArena: ['wampa', 'atst']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.tradeRouteTaxation);

            expect(context.player1).toHavePrompt('Playing Trade Route Taxation will have no effect. Are you sure you want to play it?');
            context.player1.clickPrompt('Cancel');
        });

        it('Trade Route Taxation\'s ability should prevent opponent to play event for this phase (from smuggle)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['trade-route-taxation'],
                    groundArena: ['wampa', 'atst']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    resources: ['awing', 'awing', 'awing', 'awing', 'awing', 'awing', 'awing', 'awing', 'awing', 'smugglers-aid'],
                    base: { card: 'echo-base', damage: 5 },
                    hasInitiative: true,
                }
            });
            const { context } = contextRef;

            expect(context.player2).toBeAbleToSelect(context.smugglersAid);
            context.player2.passAction();

            context.player1.clickCard(context.tradeRouteTaxation);

            expect(context.player2).not.toBeAbleToSelect(context.smugglersAid);
        });

        it('Trade Route Taxation\'s ability should prevent opponent to play event for this phase (from plot)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    resources: ['trade-route-taxation', 'awing', 'awing', 'awing', 'awing', 'awing', 'awing', 'awing', 'awing', 'awing'],
                    leader: 'sabine-wren#galvanized-revolutionary'
                },
                player2: {
                    resources: ['awing', 'awing', 'awing', 'awing', 'awing', 'awing', 'awing', 'awing', 'awing', 'topple-the-summit'],
                    leader: 'anakin-skywalker#what-it-takes-to-win',
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.sabineWren);
            context.player1.clickPrompt('Deploy Sabine Wren');
            expect(context.player1).toHavePassAbilityPrompt('Play Trade Route Taxation using Plot');
            context.player1.clickPrompt('Trigger');

            context.player2.clickCard(context.anakinSkywalker);
            context.player2.clickPrompt('Deploy Anakin Skywalker');
            // can't play Topple The Summit with Plot

            expect(context.player1).toBeActivePlayer();
        });

        it('Trade Route Taxation\'s ability should prevent opponent to play event for this phase (from discard)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['aid-from-the-innocent'],
                    deck: ['one-in-a-million', 'youre-my-only-hope', 'wampa', 'atst', 'bamboozle', 'battlefield-marine'],
                },
                player2: {
                    hand: ['trade-route-taxation'],
                    groundArena: ['wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aidFromTheInnocent);
            context.player1.clickCardInDisplayCardPrompt(context.oneInAMillion);
            context.player1.clickCardInDisplayCardPrompt(context.bamboozle);
            context.player1.clickDone();

            context.player2.clickCard(context.tradeRouteTaxation);

            expect(context.player1).toBeActivePlayer();
            expect(context.player1).toBeAbleToSelectNoneOf([context.bamboozle, context.oneInAMillion]);
        });
    });
});
