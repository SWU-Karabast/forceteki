describe('Raddus', function () {
    integration(function (contextRef) {
        describe('Raddus\'s ability', function () {
            it('should give it sentinel while he has any resistance card in play (unit)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['resistance-xwing'],
                        spaceArena: ['raddus#holdos-final-command'],
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing', 'alliance-xwing'],
                    },
                });

                const { context } = contextRef;

                context.player1.passAction();
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

            it('should give it sentinel while he has any resistance card in play (upgrade)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['paige-tico#dropping-the-hammer'],
                        spaceArena: ['raddus#holdos-final-command', 'red-three#unstoppable'],
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing', 'alliance-xwing'],
                    },
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.redThree, context.raddusHoldosFinalCommand]);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(3);

                context.player1.clickCard(context.paigeTico);
                context.player1.clickPrompt('Play Paige Tico with Piloting');
                context.player1.clickCard(context.redThree);

                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.allianceXwing);
                expect(context.player2).toBeAbleToSelectExactly([context.raddusHoldosFinalCommand]);
                context.player2.clickCard(context.raddusHoldosFinalCommand);
                expect(context.allianceXwing.zoneName).toBe('discard');
                expect(context.player1).toBeActivePlayer();
                expect(context.raddusHoldosFinalCommand.damage).toBe(2);
            });

            it('should give it sentinel while he has any resistance card in play (leader)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['raddus#holdos-final-command'],
                        leader: 'admiral-holdo#were-not-alone'
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing', 'alliance-xwing'],
                    },
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.player2).toBeAbleToSelectExactly([context.raddusHoldosFinalCommand]);
                context.player2.clickCard(context.raddusHoldosFinalCommand);
                expect(context.p1Base.damage).toBe(0);
            });
        });
        describe('Raddus\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['avenger#hunting-star-destroyer', 'devastator#inescapable'],
                    },
                    player2: {
                        spaceArena: ['raddus#holdos-final-command'],
                        hand: ['old-access-codes']
                    },
                });
            });

            it('should deal damage equal to its power when defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.avengerHuntingStarDestroyer);
                context.player1.clickCard(context.raddusHoldosFinalCommand);
                context.player2.clickCard(context.raddusHoldosFinalCommand);
                context.player2.clickCard(context.devastatorInescapable);
                expect(context.raddusHoldosFinalCommand.zoneName).toBe('discard');
                expect(context.devastatorInescapable.damage).toBe(8);
            });

            it('should deal damage equal to its power including upgrades', () => {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.oldAccessCodes);
                context.player2.clickCard(context.raddusHoldosFinalCommand);
                context.player1.clickCard(context.avengerHuntingStarDestroyer);
                context.player1.clickCard(context.raddusHoldosFinalCommand);
                context.player2.clickCard(context.raddusHoldosFinalCommand);
                context.player2.clickCard(context.devastatorInescapable);
                expect(context.raddusHoldosFinalCommand.zoneName).toBe('discard');
                expect(context.devastatorInescapable.damage).toBe(9);
            });
        });
    });
});
