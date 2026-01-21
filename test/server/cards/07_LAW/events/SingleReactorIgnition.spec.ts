describe('Single Reactor Ignition', function() {
    integration(function(contextRef) {
        describe('Single Reactor Ignition\' ability', function() {
            it('should defeat all units and deal damage to the enemy base for each defeated unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['single-reactor-ignition'],
                        groundArena: ['atst'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['alliance-xwing'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.singleReactorIgnition);
                expect(context.atst).toBeInZone('discard');
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');
                expect(context.allianceXwing).toBeInZone('discard');
                expect(context.bobaFett).toBeInZone('base');
                expect(context.lukeSkywalker).toBeInZone('base');

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(3); // Wampa, Alliance X-Wing, Luke
            });
        });
    });
});
