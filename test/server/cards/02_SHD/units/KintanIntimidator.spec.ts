describe('Kintan Intimidator', function() {
    integration(function(contextRef) {
        describe('Kintan Intimidator\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['kintan-intimidator'],
                        spaceArena: ['the-mandalorian']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });
            });

            it('exaust the defender', function () {
                const { context } = contextRef;

                // attack a ready unit, it gets exhausted
                expect(context.player1).toBeAbleToSelectExactly([context.kintanIntimidator, context.theMandalorian]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickCard(context.kintanIntimidator);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                expect(context.player1).toHavePassAttackButton();
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.kintanIntimidator.exhausted).toBe(true);
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.kintanIntimidator.damage).toBe(3);
                expect(context.battlefieldMarine.exhausted).toBe(true);
            });
        });
    });
});
