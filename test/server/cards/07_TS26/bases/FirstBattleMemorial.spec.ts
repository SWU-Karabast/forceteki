describe('First Battle Memorial', function() {
    integration(function(contextRef) {
        describe('First Battle Memorial\'s Epic Action', function() {
            it('should give an Experience token to a unit for each friendly leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'first-battle-memorial',
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                        groundArena: ['wampa'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        leader: { card: 'chewbacca#walking-carpet', deployed: true },
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.firstBattleMemorial);
                expect(context.player1).toBeAbleToSelectExactly([context.darthVader, context.wampa, context.awing, context.atst, context.chewbacca]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toHaveExactUpgradeNames(['experience']);
                expect(context.firstBattleMemorial.epicActionSpent).toBeTrue();
            });

            it('should not give Experience tokens when there are no friendly leader units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'first-battle-memorial',
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.firstBattleMemorial);
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.firstBattleMemorial.epicActionSpent).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
