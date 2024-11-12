describe('Doctor Evazan, Wanted on Twelve Systems', function() {
    integration(function(contextRef) {
        describe('Doctor Evazan\'s Bounty ability', function() {
            it('should ready 12 resources', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        base: 'kestro-city',
                        leader: 'gar-saxon#viceroy-of-mandalore',
                        hand: ['avenger#hunting-star-destroyer', 'wampa'],
                        resources: 13
                    },
                    player2: {
                        groundArena: ['doctor-evazan#wanted-on-twelve-systems']
                    }
                });

                const { context } = contextRef;

                // play wampa (4 resources exhausted)
                context.player1.clickCard(context.wampa);
                context.player2.passAction();

                // play avenger (9 resources exhausted)
                context.player1.clickCard(context.avenger);

                // evazan was killed, 12 resources should be ready
                expect(context.doctorEvazan.location).toBe('discard');
                expect(context.player1.countSpendableResources()).toBe(12);
            });
        });
    });
});
