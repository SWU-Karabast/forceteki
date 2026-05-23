describe('Doctor Pershing, Dedicated To Research', function() {
    integration(function(contextRef) {
        it('Doctor Pershing\'s ability should draw a card when it has 3 or more remaining HP', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: [],
                    groundArena: ['doctor-pershing#dedicated-to-research'],
                    deck: ['wampa', 'atst'],
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.doctorPershing);
            context.player1.clickCard(context.p2Base);
            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('hand', context.player1);
            expect(context.atst).toBeInZone('deck', context.player1);
        });

        it('Doctor Pershing\'s ability should not draw when below 3 remaining HP', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: [],
                    groundArena: [{ card: 'doctor-pershing#dedicated-to-research', damage: 2 }],
                    deck: ['wampa', 'atst'],
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.doctorPershing);
            context.player1.clickCard(context.p2Base);
            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('deck', context.player1);
            expect(context.atst).toBeInZone('deck', context.player1);
        });

        it('Doctor Pershing\'s support ability should draw a card when the attacking unit has 3 or more remaining HP', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['doctor-pershing#dedicated-to-research'],
                    spaceArena: ['green-squadron-awing'],
                    deck: ['wampa', 'atst'],
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.doctorPershing);
            context.player1.clickCard(context.greenSquadronAwing);
            context.player1.clickCard(context.p2Base);
            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('hand', context.player1);
            expect(context.atst).toBeInZone('deck', context.player1);
        });
    });
});
