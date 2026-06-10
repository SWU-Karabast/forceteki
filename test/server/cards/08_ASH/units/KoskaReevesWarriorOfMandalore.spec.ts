describe('Koska Reeves, Warrior of Mandalore', function () {
    integration(function (contextRef) {
        describe('Koska Reeves\' constant ability', function() {
            it('should gain Sentinel while controlling a token unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['koska-reeves#warrior-of-mandalore'],
                        spaceArena: ['xwing']
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.koskaReeves]);
                context.player2.clickCard(context.koskaReeves);
            });

            it('should gain Sentinel while controlling a token unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battle-droid', 'koska-reeves#warrior-of-mandalore']
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.koskaReeves]);
                context.player2.clickCard(context.koskaReeves);
            });

            it('should not gain Sentinel without a token unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'koska-reeves#warrior-of-mandalore', upgrades: ['experience'] }],
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['wampa', 'battle-droid'],
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.koskaReeves, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });
        });

        describe('Koska Reeves\' When Played ability', function() {
            it('should create a Mandalorian token if a friendly unit was defeated this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['koska-reeves#warrior-of-mandalore'],
                        groundArena: ['porg']
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.porg);

                context.player1.clickCard(context.koskaReeves);

                expect(context.player2).toBeActivePlayer();
                const mandalorian = context.player1.findCardByName('mandalorian');
                expect(mandalorian).toBeInZone('groundArena', context.player1);
                expect(mandalorian.exhausted).toBeTrue();
            });

            it('should create a Mandalorian token if a friendly unit was defeated this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['koska-reeves#warrior-of-mandalore', 'no-glory-only-results'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.noGloryOnlyResults);
                context.player1.clickCard(context.wampa);

                context.player2.passAction();

                context.player1.clickCard(context.koskaReeves);

                expect(context.player2).toBeActivePlayer();
                const mandalorian = context.player1.findCardByName('mandalorian');
                expect(mandalorian).toBeInZone('groundArena', context.player1);
                expect(mandalorian.exhausted).toBeTrue();
            });

            it('should not create a Mandalorian token if no friendly unit was defeated this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['koska-reeves#warrior-of-mandalore'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.koskaReeves);

                expect(context.player2).toBeActivePlayer();
                expect(() => context.player1.findCardByName('mandalorian')).toThrowError('Could not find any cards matching name mandalorian');
            });

            it('should not create a Mandalorian token if no friendly unit was defeated this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['koska-reeves#warrior-of-mandalore'],
                        groundArena: ['porg']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['no-glory-only-results']
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.porg);

                context.player1.clickCard(context.koskaReeves);

                expect(context.player2).toBeActivePlayer();
                expect(() => context.player1.findCardByName('mandalorian')).toThrowError('Could not find any cards matching name mandalorian');
            });
        });
    });
});
