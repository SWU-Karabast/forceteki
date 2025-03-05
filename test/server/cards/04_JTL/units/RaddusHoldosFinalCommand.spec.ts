describe('Raddus', function () {
    integration(function (contextRef) {
        describe('Raddus\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['resistance-xwing', 'restored-arc170'],
                        spaceArena: ['raddus#holdos-final-command'],
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing', 'alliance-xwing'],
                    },
                });
            });

            it('should give it sentinel while he has any resistance card in play', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.restoredArc170);
                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.raddusHoldosFinalCommand]);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(3);

                context.player1.clickCard(context.resistanceXwing);
                expect(context.resistanceXwing.zoneName).toBe('spaceArena');
                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.allianceXwing);
                expect(context.player2).toBeAbleToSelectExactly([context.raddusHoldosFinalCommand]);
                context.player2.clickCard(context.raddusHoldosFinalCommand);
                expect(context.allianceXwing.zoneName).toBe('discard');
                expect(context.player1).toBeActivePlayer();
                expect(context.raddusHoldosFinalCommand.damage).toBe(2);
            });
        });
        describe('Raddus\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['avenger#hunting-star-destroyer', 'ruthless-raider'],
                    },
                    player2: {
                        spaceArena: ['raddus#holdos-final-command'],
                    },
                });
            });

            it('should deal damage equal to its power when defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickCard(context.raddusHoldosFinalCommand);
                context.player1.clickCard(context.raddusHoldosFinalCommand);
                context.player2.clickCard(context.avengerHuntingStarDestroyer);
                expect(context.raddusHoldosFinalCommand.zoneName).toBe('discard');
                expect(context.avengerHuntingStarDestroyer.zoneName).toBe('discard');
                expect(context.ruthlessRaider.zoneName).toBe('discard');
            });
        });
    });
});
