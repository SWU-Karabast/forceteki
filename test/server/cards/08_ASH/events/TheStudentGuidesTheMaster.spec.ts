describe('The Student Guides the Master', function () {
    integration(function (contextRef) {
        describe('The Student Guides the Master\'s event ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-student-guides-the-master'],
                        groundArena: ['porg', 'wampa', 'rampaging-wampa']
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
            });

            it('should give +1/+0 for each other friendly unit with less power', function () {
                const { context } = contextRef;

                // play The Student Guides the Master
                context.player1.clickCard(context.theStudentGuidesTheMaster);
                // select target unit
                context.player1.clickCard(context.rampagingWampa);

                // TODO: Verify the unit gets +1/+0 for each other friendly unit with less power
            });

            it('should give no bonus if no other friendly units have less power', function () {
                const { context } = contextRef;

                // TODO: Select a unit with the lowest power
                // TODO: Verify no bonus is applied
            });

            it('should only count friendly units, not enemy units', function () {
                const { context } = contextRef;

                // TODO: Set up scenario with enemy units having less power
                // TODO: Verify only friendly units are counted
            });

            it('should apply the bonus for this phase only', function () {
                const { context } = contextRef;

                // play The Student Guides the Master
                context.player1.clickCard(context.theStudentGuidesTheMaster);
                context.player1.clickCard(context.rampagingWampa);

                // TODO: Verify bonus is applied during the phase
                // TODO: Pass the phase and verify bonus is removed
            });
        });
    });
});
