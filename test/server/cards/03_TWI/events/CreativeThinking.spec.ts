describe('Creative Thinking', function () {
    integration(function (contextRef) {
        it('Creative Thinking\'s ability should exhaust a non-unique unit and create a Clone Trooper token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['creative-thinking', 'waylay'],
                    groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                },
                player2: {
                    spaceArena: ['cartel-spacer'],
                    leader: { card: 'boba-fett#daimyo', deployed: true },
                }
            });
            const { context } = contextRef;

            // Scenario 1: Exhaust a non-unique unit and create a Clone Trooper token
            context.player1.clickCard(context.creativeThinking);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelSpacer]);

            context.player1.clickCard(context.cartelSpacer);
            expect(context.cartelSpacer.exhausted).toBe(true);

            expect(context.player2).toBeActivePlayer();

            let cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(1);
            expect(cloneTroopers).toAllBeInZone('groundArena');

            // Scenario 2: Does not exhaust a non-unique unit and create a Clone Trooper token
            context.player2.clickCard(context.bobaFett);
            context.player2.clickCard(context.battlefieldMarine);

            context.player1.clickCard(context.waylay);
            context.player1.clickCard(context.cartelSpacer);

            context.player2.passAction();

            context.player1.moveCard(context.creativeThinking, 'hand');
            context.player1.clickCard(context.creativeThinking);

            expect(context.player2).toBeActivePlayer();

            cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(2);
            expect(cloneTroopers).toAllBeInZone('groundArena');
        });
    });
});
