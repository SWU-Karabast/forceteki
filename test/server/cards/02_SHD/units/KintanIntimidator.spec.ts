describe('Kintan Intimidator', function () {
    integration(function (contextRef) {
        describe('Kintan Intimidator\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['kintan-intimidator']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
            });

            it('should exhaust the defender when attacking a unit', function () {
                const { context } = contextRef;

                // Select Kintan Intimidator and attack the Marine
                context.player1.clickCard(context.kintanIntimidator);
                context.player1.clickCard(context.battlefieldMarine);

                // Verify that the Marine gets exhausted
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
