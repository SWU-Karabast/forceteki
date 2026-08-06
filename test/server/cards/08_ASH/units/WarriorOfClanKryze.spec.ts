describe('Warrior of Clan Kryze', function() {
    integration(function(contextRef) {
        it('should not have sentinel if there is not another exhausted friendly unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', { card: 'warrior-of-clan-kryze', exhausted: true }]
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: [{ card: 'awing', exhausted: true }],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.atst);

            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.warriorOfClanKryze, context.p1Base]);
            context.player2.clickCard(context.p1Base);

            expect(context.player1).toBeActivePlayer();
        });

        it('should have sentinel if there is another exhausted friendly ground unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', exhausted: true }, { card: 'warrior-of-clan-kryze', exhausted: true }]
                },
                player2: {
                    groundArena: ['atst'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.atst);

            expect(context.player2).toBeAbleToSelectExactly([context.warriorOfClanKryze]);
            context.player2.clickCard(context.warriorOfClanKryze);

            expect(context.player1).toBeActivePlayer();
        });

        it('should have sentinel if there is another exhausted friendly space unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'warrior-of-clan-kryze', exhausted: true }],
                    spaceArena: [{ card: 'awing', exhausted: true }],
                },
                player2: {
                    groundArena: ['atst'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.atst);

            expect(context.player2).toBeAbleToSelectExactly([context.warriorOfClanKryze]);
            context.player2.clickCard(context.warriorOfClanKryze);

            expect(context.player1).toBeActivePlayer();
        });
    });
});