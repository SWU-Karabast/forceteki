describe('Compassionate Senator', function () {
    integration(function (contextRef) {
        describe('Compassionate Senator\'s ability', function () {
            it('should heal 2 damage from a unit or a base', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['echo-base-defender', 'admiral-yularen#advising-caution'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                expect(context.echoBaseDefender.getPower()).toBe(4);
                expect(context.echoBaseDefender.getHp()).toBe(4);
                expect(context.battlefieldMarine.getHp()).toBe(3);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.admiralYularen.getPower()).toBe(2);
                expect(context.admiralYularen.getHp()).toBe(5);
            });
        });
    });
});
