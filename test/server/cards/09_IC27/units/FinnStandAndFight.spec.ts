describe('Finn, Stand and Fight', function() {
    integration(function(contextRef) {
        describe('Finn\'s gained Restore 2 ability', function() {
            it('heals 2 damage from your base on attack while upgraded', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'finn#stand-and-fight', upgrades: ['academy-training'] }],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.finn);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(3);
                expect(context.finn.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('does not heal when not upgraded', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['finn#stand-and-fight'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.finn);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('heals only the damage present on the base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'finn#stand-and-fight', upgrades: ['academy-training'] }],
                        base: { card: 'echo-base', damage: 1 }
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.finn);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('gains Restore 2 from a Shield token', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'finn#stand-and-fight', upgrades: ['shield'] }],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.finn);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('loses Restore 2 when the upgrade is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'finn#stand-and-fight', upgrades: ['academy-training'] }],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        hand: ['confiscate'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                // Opponent defeats Finn's upgrade
                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.academyTraining);

                context.player1.clickCard(context.finn);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
