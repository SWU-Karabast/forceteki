describe('Reckless Sacrifice', function () {
    integration(function (contextRef) {
        describe('Reckless Sacrifice\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reckless-sacrifice', 'porg', 'greedo#slow-on-the-draw', 'takedown', 'fulcrum', 'sugi#hired-guardian'],
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['chewbacca#faithful-first-mate'],
                    }
                });
            });

            it('should discard a unit from hand to deal 5 damage to a unit which cost more than the discarded unit (4 cost)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.recklessSacrifice);
                // cannot choose event or upgrade from hand
                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.greedo, context.sugi]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.sugi);

                // wampa is equal, awing is less
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.chewbacca]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.chewbacca);

                expect(context.player2).toBeActivePlayer();
                expect(context.chewbacca.damage).toBe(5);
            });

            it('should discard a unit from hand to deal 5 damage to a unit which cost more than the discarded unit (1 cost)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.recklessSacrifice);
                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.greedo, context.sugi]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.greedo);

                // awing is less
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.chewbacca, context.wampa]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.chewbacca);

                expect(context.player2).toBeActivePlayer();
                expect(context.chewbacca.damage).toBe(5);
            });

            it('should discard a unit from hand to deal 5 damage to a unit which cost more than the discarded unit (0 cost)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.recklessSacrifice);
                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.greedo, context.sugi]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.porg);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.chewbacca, context.wampa, context.awing]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toBeInZone('discard');
            });
        });
    });
});
