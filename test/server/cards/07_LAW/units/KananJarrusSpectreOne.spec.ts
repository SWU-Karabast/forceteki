describe('Kanan Jarrus, Spectre One', function() {
    integration(function(contextRef) {
        describe('Kanan\'s when played ability', function() {
            it('should return a unit that costs 4 or less to its owner\'s hand (command)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['kanan-jarrus#spectre-one'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        hasInitiative: true,
                        spaceArena: ['awing'],
                        leader: 'rio-durant#wisecracking-wheelman',
                        groundArena: ['pyke-sentinel', 'wampa', 'atst']
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.rioDurant);
                context.player2.clickPrompt('Deploy Rio Durant as a Pilot');
                context.player2.clickCard(context.awing);

                context.player1.clickCard(context.kananJarrus);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.kananJarrus, context.pykeSentinel, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('hand', context.player2);
            });

            it('should return a unit that costs 4 or less to its owner\'s hand (aggression)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['kanan-jarrus#spectre-one'],
                        groundArena: ['karis-nemik#freedom-is-a-pure-idea'],
                    },
                    player2: {
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                        groundArena: ['pyke-sentinel', 'wampa', 'atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.kananJarrus);
                expect(context.player1).toBeAbleToSelectExactly([context.karisNemik, context.kananJarrus, context.pykeSentinel, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('hand', context.player2);
            });

            it('should return a unit that costs 2 or less to its owner\'s hand (no command or aggression)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['kanan-jarrus#spectre-one'],
                        spaceArena: ['awing'],
                        groundArena: ['yoda#old-master'],
                    },
                    player2: {
                        leader: 'sabine-wren#galvanized-revolutionary',
                        groundArena: ['pyke-sentinel', 'wampa', 'atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.kananJarrus);
                expect(context.player1).toBeAbleToSelectExactly([context.awing, context.pykeSentinel]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toBeInZone('hand', context.player1);
            });

            it('should return a unit that costs 2 or less to its owner\'s hand (traitorous)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['kanan-jarrus#spectre-one'],
                        spaceArena: ['awing'],
                    },
                    player2: {
                        leader: 'sabine-wren#galvanized-revolutionary',
                        hand: ['traitorous'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;
                context.player2.clickCard(context.traitorous);
                context.player2.clickCard(context.awing);

                context.player1.clickCard(context.kananJarrus);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toBeInZone('hand', context.player1);
            });
        });
    });
});
