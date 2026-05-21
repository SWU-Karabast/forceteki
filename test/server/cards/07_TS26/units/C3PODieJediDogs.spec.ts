describe('C-3PO, Die, Jedi Dogs!', function () {
    integration(function (contextRef) {
        describe('C-3P0\'s abilities', function () {
            it('should make an opponent takes control when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['c3po#die-jedi-dogs'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.c3po);

                expect(context.player2).toBeActivePlayer();
                expect(context.c3po).toBeInZone('groundArena', context.player2);
            });

            it('should not be usable by controller (can only attack)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['c3po#die-jedi-dogs'],
                        hasInitiative: true,
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.c3po);

                expect(context.player2).toHavePrompt('Choose a target for attack');
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.wampa]);

                context.player2.clickCard(context.p1Base);
                expect(context.player1).toBeActivePlayer();
            });

            it('should be usable by opponent and deal damage equal to his power to another ground unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        spaceArena: ['awing'],
                    },
                    player2: {
                        groundArena: ['c3po#die-jedi-dogs', 'yoda#old-master'],
                    }
                });
                const { context } = contextRef;

                expect(context.c3po).toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.player1).toHavePrompt('Deal 2 damage to another ground unit');
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.wampa]);
                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.yoda.damage).toBe(2);
                expect(context.c3po.exhausted).toBeTrue();
            });

            it('should be usable by opponent and deal damage equal to his power to another ground unit (upgraded)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst'],
                        spaceArena: ['awing'],
                    },
                    player2: {
                        groundArena: [{ card: 'c3po#die-jedi-dogs', upgrades: ['mastery'] }, 'yoda#old-master'],
                    }
                });
                const { context } = contextRef;

                expect(context.c3po).toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.player1).toHavePrompt('Deal 5 damage to another ground unit');
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(5);
                expect(context.c3po.exhausted).toBeTrue();
            });
        });
    });
});
