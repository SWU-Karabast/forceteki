describe('Grand Moff Tarkin, Cracking Down on Lothal', function () {
    integration(function (contextRef) {
        describe('Grand Moff Tarkin\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['grand-moff-tarkin#cracking-down-on-lothal', 'pyke-sentinel', 'wampa'],
                        spaceArena: ['black-sun-starfighter'],
                    },
                    player2: {
                        groundArena: ['echo-base-defender'],
                    }
                });
            });

            it('should give each friendly unit with Sentinel +1/+1', function () {
                const { context } = contextRef;

                // Friendly Sentinel units get +1/+1 in both arenas
                expect(context.pykeSentinel.getPower()).toBe(3);
                expect(context.pykeSentinel.getHp()).toBe(4);
                expect(context.blackSunStarfighter.getPower()).toBe(4);
                expect(context.blackSunStarfighter.getHp()).toBe(3);

                // Units without Sentinel are unaffected, including Tarkin himself
                expect(context.grandMoffTarkin.getPower()).toBe(3);
                expect(context.grandMoffTarkin.getHp()).toBe(6);
                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);

                // Enemy units with Sentinel are unaffected
                expect(context.echoBaseDefender.getPower()).toBe(4);
                expect(context.echoBaseDefender.getHp()).toBe(3);
            });
        });

        describe('Grand Moff Tarkin with Sentinel', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'grand-moff-tarkin#cracking-down-on-lothal', upgrades: ['protector'] }],
                    },
                });
            });

            it('should give himself +1/+1 if he gains Sentinel (e.g. from Protector)', function () {
                const { context } = contextRef;

                // 3/6 base +1/+1 from Protector +1/+1 from his own ability = 5/8
                expect(context.grandMoffTarkin.getPower()).toBe(5);
                expect(context.grandMoffTarkin.getHp()).toBe(8);
            });
        });
    });
});
