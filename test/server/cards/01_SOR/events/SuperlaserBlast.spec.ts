describe('Superlaser Blast', function() {
    integration(function(contextRef) {
        describe('Superlaser Blast', function() {
            integration(function(contextRef) {
                describe('Superlaser Blast\' ability', function() {
                    beforeEach(async function () {
                        await contextRef.setupTestAsync({
                            phase: 'action',
                            player1: {
                                hand: ['superlaser-blast'],
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
                    });

                    it('should defeat all units', function () {
                        const { context } = contextRef;

                        context.player1.clickCard(context.superlaserBlast);
                        expect(context.atst).toBeInZone('discard');
                        expect(context.cartelSpacer).toBeInZone('discard');
                        expect(context.wampa).toBeInZone('discard');
                        expect(context.allianceXwing).toBeInZone('discard');
                        expect(context.bobaFett).toBeInZone('base');
                        expect(context.lukeSkywalker).toBeInZone('base');
                    });
                });
            });
        });
    });
});
