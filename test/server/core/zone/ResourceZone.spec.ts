describe('Resource zone', function() {
    integration(function(contextRef) {
        describe('rearrangeResourcesToExhaustState', function() {
            it('should exhaust the chosen resources by swapping state with other exhausted resources', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        resources: [
                            'wampa',
                            'battlefield-marine',
                            { card: 'pyke-sentinel', exhausted: true },
                            { card: 'atst', exhausted: true },
                            'cartel-spacer'
                        ]
                    }
                });

                const { context } = contextRef;

                // Wampa and Battlefield Marine swap state with the exhausted Pyke Sentinel and AT-ST
                context.player1.player.resourceZone.rearrangeResourcesToExhaustState([context.wampa, context.battlefieldMarine], true);

                expect(context.wampa.exhausted).toBeTrue();
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.pykeSentinel.exhausted).toBeFalse();
                expect(context.atst.exhausted).toBeFalse();
                expect(context.cartelSpacer.exhausted).toBeFalse();
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('should ready the chosen resources by swapping state with other ready resources', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        resources: [
                            { card: 'wampa', exhausted: true },
                            { card: 'battlefield-marine', exhausted: true },
                            'pyke-sentinel',
                            { card: 'atst', exhausted: true }
                        ]
                    }
                });

                const { context } = contextRef;

                // Wampa swaps state with the ready Pyke Sentinel
                context.player1.player.resourceZone.rearrangeResourcesToExhaustState([context.wampa], false);

                expect(context.wampa.exhausted).toBeFalse();
                expect(context.pykeSentinel.exhausted).toBeTrue();
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.atst.exhausted).toBeTrue();
                expect(context.player1.readyResourceCount).toBe(1);
            });

            it('should leave chosen resources that are already in the requested state untouched', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        resources: [
                            { card: 'wampa', exhausted: true },
                            'battlefield-marine',
                            { card: 'pyke-sentinel', exhausted: true }
                        ]
                    }
                });

                const { context } = contextRef;

                // Wampa is already exhausted, so only Battlefield Marine swaps state with Pyke Sentinel
                context.player1.player.resourceZone.rearrangeResourcesToExhaustState([context.wampa, context.battlefieldMarine], true);

                expect(context.wampa.exhausted).toBeTrue();
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.pykeSentinel.exhausted).toBeFalse();
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('should exhaust as many chosen resources as possible when there are not enough exhausted resources to swap with', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        resources: [
                            'wampa',
                            'battlefield-marine',
                            'pyke-sentinel',
                            { card: 'atst', exhausted: true }
                        ]
                    }
                });

                const { context } = contextRef;

                // Only the AT-ST is exhausted, so just one of the 3 chosen resources can be exhausted
                const chosen = [context.wampa, context.battlefieldMarine, context.pykeSentinel];
                context.player1.player.resourceZone.rearrangeResourcesToExhaustState(chosen, true);

                // Exactly one chosen resource is exhausted and the AT-ST is readied
                expect(chosen.filter((card) => card.exhausted).length).toBe(1);
                expect(context.atst.exhausted).toBeFalse();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });
    });
});
