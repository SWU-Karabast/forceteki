describe('Emperor\'s Royal Guard', function () {
    integration(function (contextRef) {
        describe('Emperor\'s Royal Guard\'s constant ability', function () {
            it('should gain 1 health when controlling Emperor Palpatine unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['emperor-palpatine#master-of-the-dark-side'],
                        groundArena: ['emperors-royal-guard']
                    }
                });

                const { context } = contextRef;
                expect(context.emperorsRoyalGuard.getHp()).toBe(4);
                context.player1.clickCard(context.emperorPalpatine);
                expect(context.emperorsRoyalGuard.getHp()).toBe(5);
            });

            it('should gain 1 health when controlling Emperor Palpatine leader', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'emperor-palpatine#galactic-ruler',
                        groundArena: ['emperors-royal-guard']
                    }
                });

                const { context } = contextRef;
                expect(context.emperorsRoyalGuard.getHp()).toBe(5);
            });

            it('should gain Sentinel when controlling an Official', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wartime-trade-official'],
                        groundArena: ['emperors-royal-guard']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;
                context.player1.passAction();
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.emperorsRoyalGuard, context.p1Base]);
                context.player2.clickCard(context.p1Base);

                context.moveToNextActionPhase();
                context.player1.clickCard(context.wartimeTradeOfficial);
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.emperorsRoyalGuard);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
                expect(context.emperorsRoyalGuard.damage).toBe(3);
            });
        });
    });
});
