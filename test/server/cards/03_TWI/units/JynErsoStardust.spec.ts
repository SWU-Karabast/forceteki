describe('Jyn Erso, Stardust', function () {
    integration(function (contextRef) {
        it('Jyn Erso\'s ability should give +1/+0 and saboteur while an enemy unit has been defeated this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'jyn-erso#stardust', upgrades: ['experience', 'experience', 'experience'] }],
                },
                player2: {
                    groundArena: ['echo-base-defender'],
                }
            });

            const { context } = contextRef;

            // attack, no unit was defeated this phase, jyn should not have +1 and saboteur
            context.player1.clickCard(context.jynErso);
            context.player1.clickCard(context.echoBaseDefender);
            expect(context.echoBaseDefender).toBeInZone('discard');

            context.player2.moveCard(context.echoBaseDefender, 'groundArena');

            context.readyCard(context.jynErso);
            context.player2.passAction();

            // attack with jyn, she should have +1/+0 and saboteur because echo base defender already died
            context.player1.clickCard(context.jynErso);
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.echoBaseDefender]);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(7);

            context.moveToNextActionPhase();

            expect(context.jynErso.getPower()).toBe(6);
            context.player1.clickCard(context.jynErso);
            context.player1.clickCard(context.echoBaseDefender);
            expect(context.echoBaseDefender).toBeInZone('discard');
        });

        it('Jyn Erso\'s ability should count a friendly unit that was taken and defeated with No Glory, Only Results as an enemy unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jyn-erso#stardust', 'battlefield-marine'],
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['echo-base-defender'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            expect(context.jynErso.getPower()).toBe(3);

            // player2 takes control of Battlefield Marine and defeats it, so it was an enemy unit for player1 when it was defeated
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('discard', context.player1);

            expect(context.jynErso.getPower()).toBe(4);

            // Saboteur lets Jyn ignore the Sentinel
            context.player1.clickCard(context.jynErso);
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.echoBaseDefender]);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
