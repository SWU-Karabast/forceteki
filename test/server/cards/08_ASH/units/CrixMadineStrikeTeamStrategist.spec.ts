describe('Crix Madine, Strike Team Strategist', function () {
    integration(function (contextRef) {
        describe('Crix Madine\'s When Played ability', function() {
            it('should allow playing a Resource unit from hand with 4 cost reduction when controlling most units in both arenas', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['crix-madine#strike-team-strategist', 'wampa', 'green-squadron-awing', 'chewbacca#loyal-companion'],
                        spaceArena: ['awing', 'the-marauder#shuttling-the-bad-batch'],
                        groundArena: ['porg'],
                        base: 'jabbas-palace',
                        leader: 'captain-rex#fighting-for-his-brothers'
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.crixMadine);

                expect(context.player1).toHavePrompt('Play a Heroism unit from your hand. It costs 4 resources less.');
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.chewbacca]);
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.chewbacca);

                expect(context.player2).toBeActivePlayer();
                expect(context.chewbacca).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should allow playing a Resource unit from hand with 2 cost reduction when controlling most units in only one arena', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['crix-madine#strike-team-strategist', 'wampa', 'green-squadron-awing', 'chewbacca#loyal-companion'],
                        spaceArena: ['awing', 'the-marauder#shuttling-the-bad-batch'],
                        base: 'jabbas-palace',
                        leader: 'captain-rex#fighting-for-his-brothers'
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.crixMadine);

                expect(context.player1).toHavePrompt('Play a Heroism unit from your hand. It costs 2 resources less.');
                context.player1.clickCard(context.chewbacca);

                expect(context.player2).toBeActivePlayer();
                expect(context.chewbacca).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(6);
            });

            it('should allow playing a Resource unit from hand with 0 cost reduction when not controlling most units in any arena', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['crix-madine#strike-team-strategist', 'wampa', 'green-squadron-awing', 'chewbacca#loyal-companion'],
                        base: 'jabbas-palace',
                        leader: 'captain-rex#fighting-for-his-brothers'
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.crixMadine);

                expect(context.player1).toHavePrompt('Play a Heroism unit from your hand. As your opponent controls more or equal units than you in both arena, there is no cost reduction.');
                context.player1.clickCard(context.chewbacca);

                expect(context.player2).toBeActivePlayer();
                expect(context.chewbacca).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(8);
            });

            it('should allow playing a Resource unit from hand with 0 cost reduction when not controlling most units in any arena (an arena is emtpy)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['crix-madine#strike-team-strategist', 'wampa', 'green-squadron-awing', 'chewbacca#loyal-companion'],
                        base: 'jabbas-palace',
                        leader: 'captain-rex#fighting-for-his-brothers'
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.crixMadine);

                expect(context.player1).toHavePrompt('Play a Heroism unit from your hand. As your opponent controls more or equal units than you in both arena, there is no cost reduction.');
                context.player1.clickCard(context.chewbacca);

                expect(context.player2).toBeActivePlayer();
                expect(context.chewbacca).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(8);
            });
        });
    });
});
