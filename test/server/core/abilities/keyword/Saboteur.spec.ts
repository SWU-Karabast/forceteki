describe('Saboteur keyword', function() {
    integration(function(contextRef) {
        describe('When a unit with the Saboteur keyword attacks', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['resourceful-pursuers']
                    },
                    player2: {
                        groundArena: ['echo-base-defender',
                            { card: 'wampa', upgrades: ['shield', 'shield', 'resilient'] }
                        ],
                        spaceArena: ['system-patrol-craft']
                    }
                });
            });

            it('it may bypass Sentinel', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.resourcefulPursuers);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.echoBaseDefender, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);
                expect(context.resourcefulPursuers.damage).toBe(0);
                expect(context.echoBaseDefender).toBeInLocation('ground arena');
                expect(context.wampa.zoneName).toBe('ground arena');
            });

            it('a unit with shields, the shields are defeated before the attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.resourcefulPursuers);
                context.player1.clickCard(context.wampa);
                expect(context.resourcefulPursuers.damage).toBe(4);
                expect(context.echoBaseDefender).toBeInLocation('ground arena');
                expect(context.wampa.damage).toBe(5);
                expect(context.wampa).toBeInLocation('ground arena');
                expect(context.wampa).toHaveExactUpgradeNames(['resilient']);
            });
        });
    });

    // TODO test how Saboteur interacts with cross-arena targeting and Sentinel
});
