describe('Ima-Gun Di, Holding Out for Resupply', function() {
    integration(function(contextRef) {
        it('should allow resourcing a card from hand and then the top card of the deck if the controller has fewer resources than the opponent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish'],
                    resources: 8
                },
                player2: {
                    groundArena: ['imagun-di#holding-out-for-resupply'],
                    hand: ['daring-raid'],
                    deck: ['resupply', 'battlefield-marine'],
                    resources: 4
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.vanquish);
            context.player1.clickCard(context.imagunDi);

            expect(context.player2).toHavePrompt('Select a card from your hand to resource. If you do, resource the top card of your deck.');
            expect(context.player2).toHaveChooseNothingButton();
            context.player2.clickCard(context.daringRaid);

            expect(context.daringRaid).toBeInZone('resource', context.player2);
            expect(context.resupply).toBeInZone('resource', context.player2);
            expect(context.battlefieldMarine).toBeInZone('deck', context.player2);
            expect(context.imagunDi).toBeInZone('discard', context.player2);
            expect(context.player2.resources.length).toBe(6);
            expect(context.player2).toBeActivePlayer();
        });

        it('should allow choosing nothing', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish'],
                    resources: 8
                },
                player2: {
                    groundArena: ['imagun-di#holding-out-for-resupply'],
                    hand: ['daring-raid'],
                    deck: ['resupply', 'battlefield-marine'],
                    resources: 4
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.vanquish);
            context.player1.clickCard(context.imagunDi);

            expect(context.player2).toHavePrompt('Select a card from your hand to resource. If you do, resource the top card of your deck.');
            expect(context.player2).toHaveChooseNothingButton();
            context.player2.clickPrompt('Choose nothing');

            expect(context.daringRaid).toBeInZone('hand', context.player2);
            expect(context.resupply).toBeInZone('deck', context.player2);
            expect(context.battlefieldMarine).toBeInZone('deck', context.player2);
            expect(context.imagunDi).toBeInZone('discard', context.player2);
            expect(context.player2.resources.length).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not work if players have the same resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish'],
                    resources: 8
                },
                player2: {
                    groundArena: ['imagun-di#holding-out-for-resupply'],
                    hand: ['daring-raid'],
                    deck: ['resupply', 'battlefield-marine'],
                    resources: 8
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.vanquish);
            context.player1.clickCard(context.imagunDi);

            expect(context.player2).not.toHavePrompt('Select a card from your hand to resource. If you do, resource the top card of your deck.');

            expect(context.daringRaid).toBeInZone('hand', context.player2);
            expect(context.resupply).toBeInZone('deck', context.player2);
            expect(context.battlefieldMarine).toBeInZone('deck', context.player2);
            expect(context.imagunDi).toBeInZone('discard', context.player2);
            expect(context.player2.resources.length).toBe(8);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not work if ima-gun di controller has more resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish'],
                    resources: 8
                },
                player2: {
                    groundArena: ['imagun-di#holding-out-for-resupply'],
                    hand: ['daring-raid'],
                    deck: ['resupply', 'battlefield-marine'],
                    resources: 10
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.vanquish);
            context.player1.clickCard(context.imagunDi);

            expect(context.player2).not.toHavePrompt('Select a card from your hand to resource. If you do, resource the top card of your deck.');

            expect(context.daringRaid).toBeInZone('hand', context.player2);
            expect(context.resupply).toBeInZone('deck', context.player2);
            expect(context.battlefieldMarine).toBeInZone('deck', context.player2);
            expect(context.imagunDi).toBeInZone('discard', context.player2);
            expect(context.player2.resources.length).toBe(10);
            expect(context.player2).toBeActivePlayer();
        });

        it('should work with NGOR', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish'],
                    groundArena: ['imagun-di#holding-out-for-resupply'],
                    resources: 20
                },
                player2: {
                    hand: ['daring-raid', 'no-glory-only-results'],
                    deck: ['resupply', 'battlefield-marine'],
                    resources: 10,
                    hasInitiative: true
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.imagunDi);

            expect(context.player2).toHavePrompt('Select a card from your hand to resource. If you do, resource the top card of your deck.');
            expect(context.player2).toHaveChooseNothingButton();
            context.player2.clickCard(context.daringRaid);

            expect(context.daringRaid).toBeInZone('resource', context.player2);
            expect(context.resupply).toBeInZone('resource', context.player2);
            expect(context.battlefieldMarine).toBeInZone('deck', context.player2);
            expect(context.imagunDi).toBeInZone('discard', context.player1);
            expect(context.player2.resources.length).toBe(12);
            expect(context.player1).toBeActivePlayer();
        });

        it('should work if deck is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish'],
                    resources: 8
                },
                player2: {
                    groundArena: ['imagun-di#holding-out-for-resupply'],
                    hand: ['daring-raid'],
                    deck: [],
                    resources: 4
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.vanquish);
            context.player1.clickCard(context.imagunDi);

            expect(context.player2).toHavePrompt('Select a card from your hand to resource. If you do, resource the top card of your deck.');
            expect(context.player2).toHaveChooseNothingButton();
            context.player2.clickCard(context.daringRaid);

            expect(context.daringRaid).toBeInZone('resource', context.player2);
            expect(context.imagunDi).toBeInZone('discard', context.player2);
            expect(context.player2.resources.length).toBe(5);
            expect(context.player2).toBeActivePlayer();
        });

        it('should do nothing if hand is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish'],
                    resources: 8
                },
                player2: {
                    groundArena: ['imagun-di#holding-out-for-resupply'],
                    hand: [],
                    deck: ['resupply', 'battlefield-marine'],
                    resources: 4
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.vanquish);
            context.player1.clickCard(context.imagunDi);

            expect(context.resupply).toBeInZone('deck', context.player2);
            expect(context.battlefieldMarine).toBeInZone('deck', context.player2);
            expect(context.imagunDi).toBeInZone('discard', context.player2);
            expect(context.player2.resources.length).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });

        it('should do nothing if hand and deck are empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish'],
                    resources: 8
                },
                player2: {
                    groundArena: ['imagun-di#holding-out-for-resupply'],
                    hand: [],
                    deck: [],
                    resources: 4
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.vanquish);
            context.player1.clickCard(context.imagunDi);

            expect(context.imagunDi).toBeInZone('discard', context.player2);
            expect(context.player2.resources.length).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });
    });
});