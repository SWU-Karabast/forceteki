describe('Battered Haulcraft', function () {
    integration(function (contextRef) {
        it('Battered Haulcraft\'s ability should deal 1 damage to itself and deal 1 damage to an enemy space unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battered-haulcraft'],
                    spaceArena: ['corellian-freighter'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    spaceArena: ['green-squadron-awing', 'tieln-fighter'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.batteredHaulcraft);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.tielnFighter]);
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.batteredHaulcraft.damage).toBe(1);
            expect(context.greenSquadronAwing.damage).toBe(1);
        });

        it('Battered Haulcraft\'s ability should deal 1 damage to itself and not break anything if there are no enemy space units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battered-haulcraft'],
                    spaceArena: ['corellian-freighter'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['fleet-lieutenant'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.batteredHaulcraft);

            expect(context.batteredHaulcraft.damage).toBe(1);
            expect(context.fleetLieutenant.damage).toBe(0);
            expect(context.corellianFreighter.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});