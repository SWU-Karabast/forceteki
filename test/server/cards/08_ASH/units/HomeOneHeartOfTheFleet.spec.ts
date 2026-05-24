describe('Home One, Heart of the Fleet', function() {
    integration(function(contextRef) {
        describe('Home One\'s when played ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['home-one#heart-of-the-fleet'],
                        spaceArena: [{ card: 'green-squadron-awing', damage: 2 }, 'phoenix-squadron-awing'],
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }]
                    },
                    player2: {
                        hand: ['daring-raid', 'devastator#hunting-the-rebellion'],
                        groundArena: [{ card: 'atst', damage: 4 }, 'sabine-wren#explosives-artist', 'owen-lars#devoted-uncle'],
                    }
                });
            });

            it('should heal all damage from each friendly unit when played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.homeOne);

                expect(context.greenSquadronAwing.damage).toBe(0);
                expect(context.phoenixSquadronAwing.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.atst.damage).toBe(4);
                expect(context.sabineWrenExplosivesArtist.damage).toBe(0);
                expect(context.owenLarsDevotedUncle.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});