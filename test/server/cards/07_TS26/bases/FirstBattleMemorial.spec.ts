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

            it('should give an Experience token once for each of two deployed leaders in Faux Suns', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    format: 'fauxSuns',
                    player1: {
                        base: 'first-battle-memorial',
                        leader: { card: 'chewbacca#walking-carpet', deployed: true },
                        secondLeader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                        groundArena: ['wampa', 'atst']
                    },
                    player2: {
                        leader: 'luke-skywalker#faithful-friend'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.firstBattleMemorial);
                // 2 friendly leader units → 2 Experience tokens to distribute
                context.player1.clickCardNonChecking(context.wampa);
                context.player1.clickCardNonChecking(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toHaveExactUpgradeNames(['experience']);
                expect(context.atst).toHaveExactUpgradeNames(['experience']);
                expect(context.firstBattleMemorial.epicActionSpent).toBeTrue();
            });

            it('should count a Darksaber-bearing unit as a friendly leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'first-battle-memorial',
                        leader: { card: 'chewbacca#walking-carpet', deployed: true },
                        groundArena: [
                            'wampa',
                            'atst',
                            { card: 'mace-windu#party-crasher', upgrades: ['the-darksaber#icon-of-leadership'] }
                        ]
                    },
                    player2: {
                        leader: 'luke-skywalker#faithful-friend'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.firstBattleMemorial);
                // chewbacca (leader) + Mace with the Darksaber (a leader unit) = 2 leader units → 2 tokens
                context.player1.clickCardNonChecking(context.wampa);
                context.player1.clickCardNonChecking(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toHaveExactUpgradeNames(['experience']);
                expect(context.atst).toHaveExactUpgradeNames(['experience']);
                expect(context.firstBattleMemorial.epicActionSpent).toBeTrue();
            });
        });
    });
});
