describe('Sentinel keyword', function() {
    integration(function(contextRef) {
        describe('When a unit with the Sentinel keyword', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['liberated-slaves'],
                    },
                    player2: {
                        groundArena: ['echo-base-defender', 'battlefield-marine', 'wookiee-warrior'],
                        spaceArena: ['system-patrol-craft', 'seventh-fleet-defender', 'imperial-interceptor']
                    }
                });
            });

            it('is in play, it must be targeted by an attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.liberatedSlaves);
                expect(context.liberatedSlaves.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(0);
                expect(context.liberatedSlaves.damage).toBe(4);
                expect(context.echoBaseDefender).toBeInLocation('discard');
            });
        });

        describe('When two units with the Sentinel keyword', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['liberated-slaves'],
                    },
                    player2: {
                        groundArena: ['echo-base-defender', 'pyke-sentinel', 'battlefield-marine', 'wookiee-warrior'],
                        spaceArena: ['system-patrol-craft', 'seventh-fleet-defender', 'imperial-interceptor']
                    }
                });
            });

            it('are in play, either may be targeted by an attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.liberatedSlaves);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.echoBaseDefender]);
                context.player1.clickCard(context.echoBaseDefender);
                expect(context.liberatedSlaves.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(0);
                expect(context.liberatedSlaves.damage).toBe(4);
                expect(context.echoBaseDefender).toBeInLocation('discard');
            });
        });
    });
    // TODO add a test for cross-arena Sentinel logic
});
