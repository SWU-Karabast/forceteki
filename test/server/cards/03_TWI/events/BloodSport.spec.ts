describe('Blood Sport', function() {
    integration(function(contextRef) {
        describe('Blood Sport\'s ability', function() {
            describe('when ground arena is not empty', function() {
                beforeEach(async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['blood-sport'],
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

                describe('when played with targets', function() {
                    it('should deal 2 damage to each ground unit', function () {
                        const { context } = contextRef;

                        context.player1.clickCard(context.bloodSport);

                        expect(context.atst.damage).toBe(2);
                        expect(context.cartelSpacer.damage).toBe(0);
                        expect(context.wampa.damage).toBe(2);
                        expect(context.allianceXwing.damage).toBe(0);
                        expect(context.bobaFett.damage).toBe(2);
                        expect(context.lukeSkywalker.damage).toBe(2);
                    });
                });
            });
        });
    });
});