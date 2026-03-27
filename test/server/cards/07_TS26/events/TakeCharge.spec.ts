describe('Take Charge', function () {
    integration(function (contextRef) {
        describe('Take Charge\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['take-charge'],
                        groundArena: ['battlefield-marine', 'yoda#old-master'],
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['awing'],
                    }
                });
            });

            it('should give an Experience token to up to 3 units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.takeCharge);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.yoda, context.atst, context.wampa, context.awing]);

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.wampa);
                context.player1.clickCardNonChecking(context.awing);

                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);

                expect(context.atst).toHaveExactUpgradeNames(['experience']);
                expect(context.yoda).toHaveExactUpgradeNames(['experience']);
                expect(context.wampa).toHaveExactUpgradeNames(['experience']);
                expect(context.awing).toHaveExactUpgradeNames([]);
            });

            it('should give an Experience token to up to 3 units (choose less)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.takeCharge);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.yoda, context.atst, context.wampa, context.awing]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(context.atst);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.wampa);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);

                expect(context.atst).toHaveExactUpgradeNames(['experience']);
                expect(context.wampa).toHaveExactUpgradeNames(['experience']);
                expect(context.yoda).toHaveExactUpgradeNames([]);
                expect(context.awing).toHaveExactUpgradeNames([]);
            });
        });

        it('Take Charge\'s ability should costs 1 resource less by friendly leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['take-charge'],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true },
                    base: 'echo-base'
                },
                player2: {
                    groundArena: ['wampa'],
                    leader: { card: 'darth-vader#dont-fail-me-again', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeCharge);
            context.player1.clickCard(context.chewbacca);
            context.player1.clickDone();

            expect(context.player2).toBeActivePlayer();
            expect(context.chewbacca).toHaveExactUpgradeNames(['experience']);
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });
    });
});
