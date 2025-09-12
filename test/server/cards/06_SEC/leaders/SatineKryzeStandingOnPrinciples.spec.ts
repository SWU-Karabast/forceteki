describe('Satine Kryze, Standing on Principles', function () {
    integration(function (contextRef) {
        describe('Satine Kryze\'s leader side action ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'satine-kryze#standing-on-principles',
                        groundArena: [{ card: 'wampa', damage: 3 }],
                    },
                    player2: {
                        groundArena: [{ card: 'atst', damage: 1 }]
                    },
                });
            });

            it('should heal up to 2 damage from a unit and deal that much damage to the base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.satineKryze);
                context.player1.clickPrompt('Heal up to 2 damage from a unit. If you do, deal that much damage to your base');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.wampa, 2],
                ]));

                expect(context.satineKryze.exhausted).toBeTrue();
                expect(context.wampa.damage).toBe(1);
                expect(context.atst.damage).toBe(1);
                expect(context.p1Base.damage).toBe(2);
            });

            it('should heal 1 damage from a unit and deal that much damage to the base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.satineKryze);
                context.player1.clickPrompt('Heal up to 2 damage from a unit. If you do, deal that much damage to your base');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.atst, 1],
                ]));

                expect(context.satineKryze.exhausted).toBeTrue();
                expect(context.wampa.damage).toBe(3);
                expect(context.atst.damage).toBe(0);
                expect(context.p1Base.damage).toBe(1);
            });

            it('should not heal damage from a unit and should not deal damage to the base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.satineKryze);
                context.player1.clickPrompt('Heal up to 2 damage from a unit. If you do, deal that much damage to your base');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.wampa, 0],
                ]));

                expect(context.satineKryze.exhausted).toBeTrue();
                expect(context.wampa.damage).toBe(3);
                expect(context.atst.damage).toBe(1);
                expect(context.p1Base.damage).toBe(0);
            });
        });
    });
});