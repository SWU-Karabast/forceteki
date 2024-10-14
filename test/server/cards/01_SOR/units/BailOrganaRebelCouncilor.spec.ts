describe('Bail Organa', function () {
    integration(function () {
        describe('Bail Organa\'s ability', function () {
            const { context } = contextRef;

            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['bail-organa#rebel-councilor', 'battlefield-marine'],
                        spaceArena: ['red-three#unstoppable']
                    },
                    player2: {
                        groundArena: ['rugged-survivors', 'cargo-juggernaut']
                    }
                });
            });

            it('should give an Experience to an another friendly unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bailOrgana);
                context.player1.clickPrompt('Give an Experience token to another friendly unit');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.redThree]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.bailOrgana.exhausted).toBeTrue();
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
