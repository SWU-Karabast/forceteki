describe('Corvus, Inferno Squadron Raider', function() {
    integration(function(contextRef) {
        describe('Corvus\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['corvus#inferno-squadron-raider'],
                        groundArena: ['astromech-pilot'],
                        spaceArena: [{ card: 'green-squadron-awing', upgrades: ['determined-recruit'] }]
                    }
                });
            });

            it('can attach a pilot to it when played', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.corvus);
                context.player1.clickCard(context.astromechPilot);
                expect(context.corvus).toHaveExactUpgradeNames(['astromech-pilot']);
            });
        });
    });
});