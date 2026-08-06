describe('Lang, Arrogant Mercenary', function () {
    integration(function (contextRef) {
        describe('Lang\'s abilities', function () {
            it('should deal damage equal to his power to a ground unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'lang#arrogant-mercenary'],
                        spaceArena: ['awing'],
                    },
                    player2: {
                        groundArena: ['yoda#old-master'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.lang);
                context.player1.clickPrompt('Deal damage equal to this unit\'s power to a ground unit');
                expect(context.player1).toHavePrompt('Deal 2 damage to a ground unit');
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.wampa, context.lang]);
                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.yoda.damage).toBe(2);
                expect(context.lang.exhausted).toBeTrue();
            });

            it('should deal damage equal to his power to himself', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'lang#arrogant-mercenary'],
                        spaceArena: ['awing'],
                    },
                    player2: {
                        groundArena: ['yoda#old-master'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.lang);
                context.player1.clickPrompt('Deal damage equal to this unit\'s power to a ground unit');
                expect(context.player1).toHavePrompt('Deal 2 damage to a ground unit');
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.wampa, context.lang]);
                context.player1.clickCard(context.lang);

                expect(context.player2).toBeActivePlayer();
                expect(context.lang.damage).toBe(2);
                expect(context.lang.exhausted).toBeTrue();
            });

            it('should be usable by opponent and deal damage equal to his power to another ground unit (upgraded)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'lang#arrogant-mercenary', upgrades: ['mastery'] }, 'atst'],
                        spaceArena: ['awing'],
                    },
                    player2: {
                        groundArena: ['yoda#old-master'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.lang);
                context.player1.clickPrompt('Deal damage equal to this unit\'s power to a ground unit');
                expect(context.player1).toHavePrompt('Deal 5 damage to a ground unit');
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.atst, context.lang]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(5);
                expect(context.lang.exhausted).toBeTrue();
            });
        });
    });
});