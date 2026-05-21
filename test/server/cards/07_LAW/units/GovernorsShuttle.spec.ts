describe('Governor\'s Shuttle', function() {
    integration(function(contextRef) {
        describe('Governor\'s Shuttle\'s when played ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['governors-shuttle'],
                        groundArena: ['atst'],
                        leader: { card: 'emperor-palpatine#galactic-ruler', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['lurking-tie-phantom'],
                    }
                });
            });

            it('should make each player choose a unit and defeat it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.governorsShuttle);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.lurkingTiePhantom]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).not.toHavePassAbilityButton();
                context.player2.clickCard(context.wampa);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.governorsShuttle, context.emperorPalpatine]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst).toBeInZone('discard', context.player1);
                expect(context.wampa).toBeInZone('discard', context.player2);
            });

            it('can choose leader unit or undefeatable unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.governorsShuttle);

                context.player2.clickCard(context.lurkingTiePhantom);
                context.player1.clickCard(context.emperorPalpatine);

                expect(context.player2).toBeActivePlayer();
                expect(context.emperorPalpatine).toBeInZone('base', context.player1);
                expect(context.lurkingTiePhantom).toBeInZone('spaceArena', context.player2);
            });
        });

        it('Governor\'s Shuttle\'s when played ability must choose itself if there is no other units', async function () {
            const { context } = contextRef;

            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['governors-shuttle'],
                },
            });

            context.player1.clickCard(context.governorsShuttle);

            expect(context.player1).toBeAbleToSelectExactly([context.governorsShuttle]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.governorsShuttle);

            expect(context.player2).toBeActivePlayer();
            expect(context.governorsShuttle).toBeInZone('discard', context.player1);
        });
    });
});
