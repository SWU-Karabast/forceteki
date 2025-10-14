describe('Corellian Hounds', function() {
    integration(function(contextRef) {
        it('Corellian Hounds\'s ability should enter play ready if opponent does not control ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['corellian-hounds'],
                    groundArena: ['atst']
                },
                player2: {
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.corellianHounds);

            expect(context.player2).toBeActivePlayer();
            expect(context.corellianHounds.exhausted).toBeFalse();
        });

        it('Corellian Hounds\'s ability should enter play ready if opponent does not control ground unit (rescue from capture)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rivals-fall'],
                    groundArena: ['atst', 'corellian-hounds']
                },
                player2: {
                    hand: ['discerning-veteran'],
                    spaceArena: ['awing'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.discerningVeteran);
            context.player2.clickCard(context.corellianHounds);

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.discerningVeteran);

            expect(context.player2).toBeActivePlayer();
            expect(context.player2.groundArenaUnits.length).toBe(0);
            expect(context.corellianHounds.exhausted).toBeFalse();
        });

        it('Corellian Hounds\'s ability should not enter play ready if opponent controls ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['corellian-hounds'],
                    groundArena: ['atst']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.corellianHounds);

            expect(context.player2).toBeActivePlayer();
            expect(context.corellianHounds.exhausted).toBeTrue();
        });
    });
});