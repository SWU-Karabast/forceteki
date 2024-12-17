describe('Admiral Yularen, Advising Caution', function () {
    integration(function (contextRef) {
        describe('Admiral Yularen\'s ability', function () {
            it('should give +0/+1 to each other friendly heroism unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['echo-base-defender', 'admiral-yularen#advising-caution', 'wampa'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                expect(context.echoBaseDefender.getPower()).toBe(4);
                expect(context.echoBaseDefender.getHp()).toBe(4);
                expect(context.battlefieldMarine.getHp()).toBe(3);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.admiralYularen.getPower()).toBe(2);
                expect(context.admiralYularen.getHp()).toBe(5);
                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
                expect(context.greenSquadronAwing.getPower()).toBe(1);
                expect(context.greenSquadronAwing.getHp()).toBe(4);
            });
        });
    });
});
