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

                // attack echo base defender with battlefield marine
                context.player2.clickCard(context.battlefieldMarine);

                // echo base defender should survive with 1 hp because yularen
                expect(context.echoBaseDefender).toBeInZone('groundArena');
                expect(context.echoBaseDefender.remainingHp).toBe(1);
            });
        });
    });
});
