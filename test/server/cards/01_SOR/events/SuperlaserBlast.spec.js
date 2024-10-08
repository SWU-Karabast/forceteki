describe('Superlaser Blast', function() {
    integration(function() {
        describe('Superlaser Blast\' ability', function() {
            beforeEach(function () {
                this.setupTest({
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
                this.player1.clickCard(this.superlaserBlast);
                expect(this.atst).toBeInLocation('discard');
                expect(this.cartelSpacer).toBeInLocation('discard');
                expect(this.wampa).toBeInLocation('discard');
                expect(this.allianceXwing).toBeInLocation('discard');
                expect(this.bobaFett).toBeInLocation('base');
                expect(this.lukeSkywalker).toBeInLocation('base');
            });
        });
    });
});
