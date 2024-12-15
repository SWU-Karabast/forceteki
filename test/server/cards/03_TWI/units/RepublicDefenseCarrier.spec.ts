describe('Republic Defense Carrier', function () {
    integration(function (contextRef) {
        it('Republic Defense Carrier\'s ability should decrease its costs by number of units opponent control', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['republic-defense-carrier'],
                    leader: 'captain-rex#fighting-for-his-brothers'
                },
                player2: {
                    groundArena: ['battlefield-marine', 'wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            // opponent have 3 units, republic defense carrier should cost 3 resources less
            context.player1.clickCard(context.republicDefenseCarrier);
            expect(context.player1.exhaustedResourceCount).toBe(8);
        });

        it('Republic Defense Carrier\'s ability should decrease its costs by number of units opponent control (opponent does not control unit) ', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['republic-defense-carrier'],
                    leader: 'captain-rex#fighting-for-his-brothers'
                },
            });

            const { context } = contextRef;

            // opponent do not have any unit, republic defense carrier should have its normal cost
            context.player1.clickCard(context.republicDefenseCarrier);
            expect(context.player1.exhaustedResourceCount).toBe(11);
        });
    });
});
