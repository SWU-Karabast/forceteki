describe('Flanking Fang Fighter', function () {
    integration(function (contextRef) {
        describe('Flanking Fang Fighter\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['keep-fighting'],
                        spaceArena: ['flanking-fang-fighter', 'green-squadron-awing']
                    },
                    player2: {
                        spaceArena: ['ruthless-raider']
                    }
                });
            });

            it('should give Raid 2 while having Fighter units ', function () {
                const { context } = contextRef;

                // attack with partisan insurgent, a-wing is here so damage should be 3
                context.player1.clickCard(context.flankingFangFighter);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4); // 2 Base power + 2 from Raid 2 ability

                // kill a-wing, friendly fighter unit no longer in play
                context.player2.clickCard(context.ruthlessRaider);
                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.greenSquadronAwing.zoneName).toBe('discard');

                // attack again with partisan insurgent, damage should be 1 because a-wing is dead
                context.player1.clickCard(context.keepFighting);
                context.player1.clickCard(context.flankingFangFighter);
                context.player2.passAction();
                context.player1.clickCard(context.flankingFangFighter);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(6); // 4 prior damage + 2 from base power
            });
        });
    });
});
