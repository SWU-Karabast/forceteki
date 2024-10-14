describe('Superlaser Blast', function() {
    integration(function(contextRef) {
        describe('Superlaser Blast', function() {
            integration(function(contextRef) {
                describe('Superlaser Blast\' ability', function() {
                    beforeEach(function () {
                        contextRef.setupTest({
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
                        expect(context.atst).toBeInLocation('discard');
                        expect(context.cartelSpacer).toBeInLocation('discard');
                        expect(context.wampa).toBeInLocation('discard');
                        expect(context.allianceXwing).toBeInLocation('discard');
                        expect(context.bobaFett).toBeInLocation('base');
                        expect(context.lukeSkywalker).toBeInLocation('base');
                    });
                });
            });
        });
    });
});
