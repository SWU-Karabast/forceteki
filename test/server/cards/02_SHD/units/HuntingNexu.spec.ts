describe('Hunting Nexu', function() {
    integration(function(contextRef) {
        describe('Hunting Nexu\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['hunting-nexu'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {}
                });
            });

            it('should have Raid 2 because we control an Aggression unit.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.huntingNexu);
                // autoselect base
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(6);
            });
        });

        describe('Hunting Nexu\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['hunting-nexu'],
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });


            it('should not have Raid 2 because we do not control an Aggression unit.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.huntingNexu);
                // autoselect base
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);
            });
        });
    });
});
