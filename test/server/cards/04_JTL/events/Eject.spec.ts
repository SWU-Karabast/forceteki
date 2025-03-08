describe('Eject', function () {
    integration(function (contextRef) {
        describe('Eject\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['eject'],
                        spaceArena: [{ card: 'alliance-xwing', upgrades: ['clone-pilot', 'academy-training'] }],
                        groundArena: ['astromech-pilot']
                    }
                });
            });

            it('should detach a Pilot upgrade', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.eject);
                expect(context.player1).toBeAbleToSelectExactly([context.clonePilot]);
                context.player1.clickCard(context.clonePilot);

                expect(context.clonePilot).toBeInZone('groundArena');
                expect(context.clonePilot.exhausted).toBeTrue();
                expect(context.allianceXwing).toHaveExactUpgradeNames(['academy-training']);
                expect(context.clonePilot.isAttached()).toBeFalse();
                expect(context.player1.handSize).toBe(1);
            });
        });
    });
});
