describe('Second Sister, Seeking the Holocron', function() {
    integration(function(contextRef) {
        it('Second Sister\'s ability should discard 2 cards from deck and ready a resource for each Force card discarded (2 Force cards)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    resources: {
                        exhaustedCount: 3,
                        readyCount: 0
                    },
                    groundArena: ['second-sister#seeking-the-holocron'],
                    deck: ['dooku#it-is-too-late', 'kylo-ren#i-know-your-story', 'atst']
                },
            });
            const { context } = contextRef;

            // Attack with Second Sister
            context.player1.clickCard(context.secondSister);
            context.player1.clickCard(context.p2Base);

            // Trigger the ability
            expect(context.player1).toHavePassAbilityPrompt('Discard 2 cards from your deck. For each Force card discarded this way, ready a resource');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();

            // Both cards should be discarded
            expect(context.dooku).toBeInZone('discard', context.player1);
            expect(context.kyloRen).toBeInZone('discard', context.player1);
            expect(context.atst).toBeInZone('deck', context.player1);

            // Both cards are Force cards, so 2 resources should be readied
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('Second Sister\'s ability can be skip', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    resources: {
                        exhaustedCount: 3,
                        readyCount: 0
                    },
                    groundArena: ['second-sister#seeking-the-holocron'],
                    deck: ['dooku#it-is-too-late', 'kylo-ren#i-know-your-story', 'atst']
                },
            });
            const { context } = contextRef;

            // Attack with Second Sister
            context.player1.clickCard(context.secondSister);
            context.player1.clickCard(context.p2Base);

            // Trigger the ability
            expect(context.player1).toHavePassAbilityPrompt('Discard 2 cards from your deck. For each Force card discarded this way, ready a resource');
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();

            expect(context.dooku).toBeInZone('deck', context.player1);
            expect(context.kyloRen).toBeInZone('deck', context.player1);
            expect(context.atst).toBeInZone('deck', context.player1);

            expect(context.player1.exhaustedResourceCount).toBe(3);
        });

        it('Second Sister\'s ability should discard 2 cards from deck and ready a resource for each Force card discarded (1 Force card)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    resources: {
                        exhaustedCount: 3,
                        readyCount: 0
                    },
                    groundArena: ['second-sister#seeking-the-holocron'],
                    deck: ['dooku#it-is-too-late', 'atst', 'kylo-ren#i-know-your-story']
                },
            });
            const { context } = contextRef;

            // Attack with Second Sister
            context.player1.clickCard(context.secondSister);
            context.player1.clickCard(context.p2Base);

            // Trigger the ability
            expect(context.player1).toHavePassAbilityPrompt('Discard 2 cards from your deck. For each Force card discarded this way, ready a resource');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();

            // Both cards should be discarded
            expect(context.dooku).toBeInZone('discard', context.player1);
            expect(context.atst).toBeInZone('discard', context.player1);
            expect(context.kyloRen).toBeInZone('deck', context.player1);

            // AT-ST is not a Force card, so 1 resource should be readied
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });

        it('Second Sister\'s ability should discard the last card from the deck and ready 1 resource', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    resources: {
                        exhaustedCount: 3,
                        readyCount: 0
                    },
                    groundArena: ['second-sister#seeking-the-holocron'],
                    deck: ['dooku#it-is-too-late']
                },
            });
            const { context } = contextRef;

            // Attack with Second Sister
            context.player1.clickCard(context.secondSister);
            context.player1.clickCard(context.p2Base);

            // Trigger the ability
            expect(context.player1).toHavePassAbilityPrompt('Discard 2 cards from your deck. For each Force card discarded this way, ready a resource');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();

            expect(context.dooku).toBeInZone('discard', context.player1);

            // only 1 card discarded (1 force)
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });

        it('Second Sister\'s ability should not ready any resource if deck is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    resources: {
                        exhaustedCount: 3,
                        readyCount: 0
                    },
                    groundArena: ['second-sister#seeking-the-holocron'],
                    deck: []
                },
            });
            const { context } = contextRef;

            // Attack with Second Sister
            context.player1.clickCard(context.secondSister);
            context.player1.clickCard(context.p2Base);

            // Trigger the ability
            expect(context.player1).toHavePassAbilityPrompt('Discard 2 cards from your deck. For each Force card discarded this way, ready a resource');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();

            // no card discarded, exhaustedResource should be 3
            expect(context.player1.exhaustedResourceCount).toBe(3);
        });
    });
});