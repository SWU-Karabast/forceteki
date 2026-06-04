describe('Poe Dameron, I\'ll Come Back For You', function () {
    integration(function (contextRef) {
        beforeEach(function() {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['poe-dameron#ill-come-back-for-you', 'battlefield-marine', 'captain-typho#all-necessary-precautions'],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['in-the-heat-of-battle'],
                    groundArena: [{ card: 'echo-base-defender', upgrades: ['shield'] }, 'wampa'],
                    spaceArena: ['concord-dawn-interceptors']
                }
            });
        });

        it('Poe Dameron\'s ability should make lose Sentinel to every unit', function () {
            const { context } = contextRef;
            context.player1.clickCard(context.battlefieldMarine);

            // everyone loose Sentinel
            expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender, context.wampa, context.p1Base]);
            context.player1.clickCard(context.echoBaseDefender);

            expect(context.player2).toBeActivePlayer();
            expect(context.echoBaseDefender.damage).toBe(0);
        });

        it('Poe Dameron\'s ability should make lose Sentinel to every unit', function () {
            const { context } = contextRef;
            context.player1.clickCard(context.awing);

            // everyone loose Sentinel
            expect(context.player1).toBeAbleToSelectExactly([context.concordDawnInterceptors, context.p1Base]);
            context.player1.clickCard(context.p1Base);

            expect(context.player2).toBeActivePlayer();
        });

        it('Poe Dameron\'s ability should make lose Sentinel to every unit', function () {
            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.wampa);

            // everyone loose Sentinel
            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.poeDameron, context.captainTypho, context.p1Base]);
            context.player1.clickCard(context.p1Base);

            expect(context.player2).toBeActivePlayer();
        });

        it('Poe Dameron\'s ability should make lose Sentinel to every unit', function () {
            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.inTheHeatOfBattle);

            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender, context.wampa, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
        });
    });
});