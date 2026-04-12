describe('Wartime Pirate', function () {
    integration(function (contextRef) {
        it('Wartime Pirate\'s ability should do opponent deals 1 damage to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['wartime-pirate'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wartimePirate);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toHavePrompt('Deal 1 damage to a unit');
            expect(context.player2).toBeAbleToSelectExactly([context.atst, context.wartimePirate, context.awing, context.wampa]);
            expect(context.player2).not.toHavePassAbilityButton();
            expect(context.player2).not.toHaveChooseNothingButton();

            context.player2.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(1);
            expect(context.p2Base.damage).toBe(4);
        });

        it('Wartime Pirate\'s ability should do opponent deals 1 damage to a unit (can be defeated before resolving combat damage)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'wartime-pirate', damage: 3 }],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wartimePirate);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeAbleToSelectExactly([context.atst, context.wartimePirate, context.awing, context.wampa]);

            context.player2.clickCard(context.wartimePirate);

            expect(context.player2).toBeActivePlayer();
            expect(context.wartimePirate).toBeInZone('discard', context.player1);
            expect(context.p2Base.damage).toBe(0);
        });
    });
});
