describe('Renew', function () {
    integration(function (contextRef) {
        describe('Renew\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['renew'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['entrenched', 'imprisoned'] }],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('should defeat a Condition upgrade and heal 3 damage from your base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.renew);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.entrenched,
                    context.imprisoned
                ]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(context.entrenched);

                expect(context.p1Base.damage).toBe(2);
                expect(context.entrenched).toBeInZone('discard', context.player2);
                expect(context.wampa).toHaveExactUpgradeNames(['imprisoned']);
            });

            it('should pass the defeat and heal 3 damage from your base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.renew);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.entrenched,
                    context.imprisoned
                ]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickPrompt('Choose nothing');

                expect(context.p1Base.damage).toBe(2);
                expect(context.wampa).toHaveExactUpgradeNames(['entrenched', 'imprisoned']);
            });
        });

        describe('Renew\'s ability without targets', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['renew'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('should heal 3 damage from your base without any upgrades to defeat', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.renew);

                expect(context.p1Base.damage).toBe(2);
            });
        });
    });
});