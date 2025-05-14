
describe('Mother Talzin, Power Through Magick', function() {
    integration(function (contextRef) {
        describe('Mother Talzin\'s undeployed ability', function () {
            it('should not be selectable without the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'mother-talzin#power-through-magick',
                        resources: 4
                    }
                });

                const { context } = contextRef;

                expect(context.player1).not.toBeAbleToSelect(context.motherTalzin);
                expect(context.motherTalzin).not.toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.motherTalzin.exhausted).toBe(false);
                expect(context.player1).toBeActivePlayer();
            });

            it('should be able to spend the Force and exhaust to give -1/-1 to a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'mother-talzin#power-through-magick',
                        hasForceToken: true,
                        resources: 4,
                        groundArena: ['porg']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.motherTalzin);
                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.motherTalzin.exhausted).toBe(true);
                expect(context.player1.hasTheForce).toBe(false);

                expect(context.battlefieldMarine.getPower()).toBe(2);
                expect(context.battlefieldMarine.getHp()).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Mother Talzin\'s deployed ability', function () {
            it('may give a unit -1/-1 on attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'mother-talzin#power-through-magick', deployed: true },
                        hasForceToken: true
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.motherTalzin);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.motherTalzin, context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.getPower()).toBe(2);
                expect(context.battlefieldMarine.getHp()).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
