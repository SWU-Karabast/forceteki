describe('Ephant Mon, Hea of Security', function () {
    integration(function (contextRef) {
        it('Ephant Mon\'s on attack ability should make a friendly unit to capture an enemy unit which attacked base this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'ephant-mon#head-of-security'],
                    spaceArena: ['millennium-falcon#piece-of-junk']
                },
                player2: {
                    groundArena: ['moisture-farmer', 'cantina-braggart', 'wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.passAction();

            // moisture farmer attack battlefield marine
            context.player2.clickCard(context.moistureFarmer);
            context.player2.clickCard(context.battlefieldMarine);
            context.player1.passAction();

            // cantina braggart attack p1 base
            context.player2.clickCard(context.cantinaBraggart);
            context.player2.clickCard(context.p1Base);
            context.player1.passAction();

            // green squadron awing attack p1 base
            context.player2.clickCard(context.greenSquadronAwing);
            context.player2.clickCard(context.p1Base);

            // ephant mon attack base
            context.player1.clickCard(context.ephantMon);
            context.player1.clickCard(context.p2Base);

            // choose an enemy unit which attack base this phase
            expect(context.player1).toBeAbleToSelectExactly([context.cantinaBraggart, context.greenSquadronAwing]);
            context.player1.clickCard(context.cantinaBraggart);

            // choose a friendly unit to capture the chosen enemy unit
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.ephantMon]);
            context.player1.clickCard(context.battlefieldMarine);

            // battlefield marine should have captured cantina braggart
            expect(context.cantinaBraggart).toBeCapturedBy(context.battlefieldMarine);
            expect(context.player2).toBeActivePlayer();

            context.ephantMon.exhausted = false;
            context.player1.moveCard(context.millenniumFalcon, 'discard');

            // enemy wampa attack base
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);

            context.player1.clickCard(context.ephantMon);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.ephantMon]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.wampa).toBeCapturedBy(context.battlefieldMarine);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
