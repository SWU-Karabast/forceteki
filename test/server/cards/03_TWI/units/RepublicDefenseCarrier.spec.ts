describe('Republic Defense Carrier', function () {
    integration(function (contextRef) {
        describe('Republic Defense Carrier\'s ability', function () {
            it('should give +0/+1 to each other friendly heroism unit', function () {
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
        });
    });
});
