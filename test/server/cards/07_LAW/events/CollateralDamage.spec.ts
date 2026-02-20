describe('Collateral Damage', function() {
    integration(function(contextRef) {
        describe('Collateral Damage\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['collateral-damage'],
                        groundArena: ['luke-skywalker#jedi-knight'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['atst', 'wampa'],
                        spaceArena: ['emissarys-sheathipede', 'phoenix-squadron-awing', 'lurking-tie-phantom'],
                    }
                });
            });

            it('should deal 2 damage to a unit and then 2 damage to another unit in same arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.collateralDamage);

                expect(context.player1).toBeAbleToSelectExactly([context.lukeSkywalker, context.greenSquadronAwing, context.atst, context.wampa, context.emissarysSheathipede, context.phoenixSquadronAwing, context.lurkingTiePhantom]);

                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(2);

                // Should prompt for second target in same arena (ground)
                expect(context.player1).toHavePrompt('Deal 2 damage to a base or a ground unit');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.lukeSkywalker, context.p2Base, context.p1Base]);

                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 2 damage to a unit and then 2 damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.collateralDamage);
                context.player1.clickCard(context.lukeSkywalker);

                expect(context.lukeSkywalker.damage).toBe(2);

                // Should prompt for second target in ground arena
                expect(context.player1).toHavePrompt('Deal 2 damage to a base or a ground unit');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.wampa, context.p2Base, context.p1Base]);

                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should work correctly with space arena units and targets', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.collateralDamage);
                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.player1).toHavePrompt('Deal 2 damage to a base or a space unit');
                expect(context.player1).toBeAbleToSelectExactly([context.emissarysSheathipede, context.phoenixSquadronAwing, context.lurkingTiePhantom, context.p2Base, context.p1Base]);

                context.player1.clickCard(context.emissarysSheathipede);

                expect(context.player2).toBeActivePlayer();
                expect(context.emissarysSheathipede.damage).toBe(2);
                expect(context.greenSquadronAwing.damage).toBe(2);
            });

            it('should work correctly if first target die', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.collateralDamage);
                context.player1.clickCard(context.phoenixSquadronAwing);

                expect(context.player1).toHavePrompt('Deal 2 damage to a base or a space unit');
                expect(context.player1).toBeAbleToSelectExactly([context.emissarysSheathipede, context.greenSquadronAwing, context.lurkingTiePhantom, context.p2Base, context.p1Base]);

                context.player1.clickCard(context.emissarysSheathipede);

                expect(context.player2).toBeActivePlayer();
                expect(context.emissarysSheathipede.damage).toBe(2);
                expect(context.phoenixSquadronAwing).toBeInZone('discard', context.player2);
            });

            it('should work correctly if first target cannot be damaged', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.collateralDamage);
                context.player1.clickCard(context.lurkingTiePhantom);

                expect(context.player1).toHavePrompt('Deal 2 damage to a base or a space unit');
                expect(context.player1).toBeAbleToSelectExactly([context.emissarysSheathipede, context.greenSquadronAwing, context.phoenixSquadronAwing, context.p2Base, context.p1Base]);

                context.player1.clickCard(context.emissarysSheathipede);

                expect(context.player2).toBeActivePlayer();
                expect(context.emissarysSheathipede.damage).toBe(2);
                expect(context.lurkingTiePhantom.damage).toBe(0);
            });
        });

        it('should be able to deal 2 damage to a base even if there is not unit in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['collateral-damage'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.collateralDamage);
            expect(context.player1).toHavePrompt('Deal 2 damage to a base');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(2);
            expect(context.p1Base.damage).toBe(0);
        });

        it('should be able to deal 2 damage to a base if the last unit was defeated by first part of ability', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['collateral-damage'],
                },
                player2: {
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.collateralDamage);
            expect(context.player1).toBeAbleToSelectExactly([context.awing]);
            context.player1.clickCard(context.awing);

            expect(context.player1).toHavePrompt('Deal 2 damage to a base or a space unit');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.awing).toBeInZone('discard', context.player2);
            expect(context.p2Base.damage).toBe(2);
            expect(context.p1Base.damage).toBe(0);
        });
    });
});
