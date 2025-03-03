
describe('Academy Graduate', function() {
    integration(function(contextRef) {
        describe('Academy Graduate ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['academy-graduate'],
                        groundArena: ['snowspeeder'],
                        spaceArena: ['alliance-xwing', 'devastating-gunship']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['restored-arc170']
                    }
                });
            });

            it('should give Sentinel to the attached unit when played as a pilot', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.academyGraduate);
                context.player1.clickPrompt('Play Academy Graduate with Piloting');
                context.player1.clickCard(context.allianceXwing);

                context.player2.clickCard(context.restoredArc170);
                expect(context.player2).toBeAbleToSelectExactly([context.allianceXwing]);
                context.player2.clickCard(context.allianceXwing);
            });

            it('should have Sentinel as a Unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.academyGraduate);
                context.player1.clickPrompt('Play Academy Graduate');

                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.academyGraduate]);
                context.player2.clickCard(context.academyGraduate);
            });
        });
    });
});