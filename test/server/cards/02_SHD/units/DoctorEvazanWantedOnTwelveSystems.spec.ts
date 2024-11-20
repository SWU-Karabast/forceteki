describe('Doctor Evazan, Wanted on Twelve Systems', function() {
    integration(function(contextRef) {
        describe('Doctor Evazan\'s Bounty ability', function() {
            it('should ready 12 resources', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        resources: 13
                    },
                    player2: {
                        groundArena: ['doctor-evazan#wanted-on-twelve-systems']
                    }
                });

                const { context } = contextRef;

                context.player1.exhaustResources(13);

                // kill evazan with wampa
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.doctorEvazan);

                // evazan was killed, 12 resources should be ready
                expect(context.doctorEvazan).toBeInZone('discard');
                expect(context.player1.readyResourceCount).toBe(12);
            });
        });
    });
});
