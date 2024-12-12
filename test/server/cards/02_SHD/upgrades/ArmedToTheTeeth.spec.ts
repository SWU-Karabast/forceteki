describe('Armed to the teeth upgrade', function () {
    integration(function (contextRef) {
        describe('Armed to the teeth\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'bokatan-kryze#fighting-for-mandalore', upgrades: ['armed-to-the-teeth'] }],
                        spaceArena: ['collections-starhopper'],
                        base: { card: 'echo-base', damage: 10 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        base: { card: 'echo-base', damage: 0 }
                    }
                });
            });

            it('ground unit has 5 power and on attack gives other unit +2, which removes at end of phase', function () {
                const { context } = contextRef;
                expect(context.bokatanKryze.getPower()).toBe(5);
                expect(context.collectionsStarhopper.getPower()).toBe(2);

                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.collectionsStarhopper);
                expect(context.p2Base.damage).toBe(5);
                expect(context.collectionsStarhopper.getPower()).toBe(4);

                context.nextPhase();
                expect(context.collectionsStarhopper.getPower()).toBe(2);
            });
        });
    });
});
