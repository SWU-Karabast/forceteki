describe('Mayor\'s Majordomo, No Problem Groveling', function() {
    integration(function(contextRef) {
        it('should discard a card from hand and exhaust an enemy unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['repair', 'vanquish'],
                    groundArena: ['wampa', 'mayors-majordomo#no-problem-groveling']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.mayorsMajordomo);
            context.player1.clickPrompt('Exhaust a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing, context.atst]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.atst);

            expect(context.player1).toBeAbleToSelectExactly([context.repair, context.vanquish]);
            context.player1.clickCard(context.vanquish);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.exhausted).toBeTrue();
            expect(context.mayorsMajordomo.exhausted).toBeTrue();
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.awing.exhausted).toBeFalse();
            expect(context.vanquish).toBeInZone('discard', context.player1);
            expect(context.repair).toBeInZone('hand', context.player1);
        });

        it('should discard a card from hand and exhaust a friendly unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['repair', 'vanquish'],
                    groundArena: ['wampa', 'mayors-majordomo#no-problem-groveling']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.mayorsMajordomo);
            context.player1.clickPrompt('Exhaust a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing, context.atst]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player1).toBeAbleToSelectExactly([context.repair, context.vanquish]);
            context.player1.clickCard(context.vanquish);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.exhausted).toBeFalse();
            expect(context.mayorsMajordomo.exhausted).toBeTrue();
            expect(context.wampa.exhausted).toBeTrue();
            expect(context.awing.exhausted).toBeFalse();
            expect(context.vanquish).toBeInZone('discard', context.player1);
            expect(context.repair).toBeInZone('hand', context.player1);
        });

        it('should not be able to do the ability if there are no cards in hand', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'mayors-majordomo#no-problem-groveling']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.mayorsMajordomo);
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.atst]);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.exhausted).toBeFalse();
            expect(context.mayorsMajordomo.exhausted).toBeTrue();
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.awing.exhausted).toBeFalse();
        });
    });
});