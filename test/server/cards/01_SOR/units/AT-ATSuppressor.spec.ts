describe('AT-AT Suppressor', function() {
    integration(function(contextRef) {
        describe('AT-AT Suppressor\'s exhaust ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['atat-suppressor'],
                        groundArena: ['pyke-sentinel', 'village-protectors'],
                        spaceArena: ['imperial-interceptor'],
                    },
                    player2: {
                        groundArena: ['wampa', 'cell-block-guard'],
                        spaceArena: ['cartel-spacer', 'system-patrol-craft'],
                    }
                });
            });

            it('should exhaust all ground units', function () {
                const { context } = contextRef;

                // Play AT-AT Suppressor
                context.player1.clickCard(context.atatSuppressor);

                // Checking all ground units are exhausted
                expect(context.pykeSentinel.exhausted).toBe(true);
                expect(context.villageProtectors.exhausted).toBe(true);
                expect(context.wampa.exhausted).toBe(true);
                expect(context.cellBlockGuard.exhausted).toBe(true);

                // Checking space units are not exhausted
                expect(context.imperialInterceptor.exhausted).toBe(false);
                expect(context.cartelSpacer.exhausted).toBe(false);
                expect(context.systemPatrolCraft.exhausted).toBe(false);
            });
        });
    });
});
