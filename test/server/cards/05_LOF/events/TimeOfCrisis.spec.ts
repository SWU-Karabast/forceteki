describe('Time of Crisis', function() {
    integration(function(contextRef) {
        describe('Time of Crisis\'s event ability', function() {
            it('should deal 3 damage each unit other than the one picked by each player', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['time-of-crisis'],
                        groundArena: ['atst', 'awakened-specters'],
                        spaceArena: ['devastator#inescapable'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['avenger#hunting-star-destroyer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.timeOfCrisis);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.awakenedSpecters, context.devastator]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.avenger, context.bobaFettDaimyo]);
                context.player2.clickCard(context.avenger);

                expect(context.atst.damage).toBe(0);
                expect(context.awakenedSpecters.damage).toBe(3);
                expect(context.devastator.damage).toBe(3);
                expect(context.wampa.damage).toBe(3);
                expect(context.avenger.damage).toBe(0);
                expect(context.bobaFettDaimyo.damage).toBe(3);
            });

            it('should deal 3 damage each unit other than the one picked by the opponent if the player does not control any unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['time-of-crisis'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['avenger#hunting-star-destroyer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.timeOfCrisis);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.avenger, context.bobaFettDaimyo]);
                context.player2.clickCard(context.avenger);

                expect(context.wampa.damage).toBe(3);
                expect(context.avenger.damage).toBe(0);
                expect(context.bobaFettDaimyo.damage).toBe(3);
            });

            it('should deal 3 damage each unit other than the one picked by the player if the opponent does not control any unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['time-of-crisis'],
                        groundArena: ['atst', 'awakened-specters'],
                        spaceArena: ['devastator#inescapable'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.timeOfCrisis);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.awakenedSpecters, context.devastator]);
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(0);
                expect(context.awakenedSpecters.damage).toBe(3);
                expect(context.devastator.damage).toBe(3);
            });

            it('should auto-select the player\'s only unit to not be damaged', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['time-of-crisis'],
                        groundArena: ['atst']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['avenger#hunting-star-destroyer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.timeOfCrisis);

                expect(context.player1).toBeAbleToSelectExactly([context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.avenger, context.bobaFettDaimyo]);
                context.player2.clickCard(context.avenger);

                expect(context.atst.damage).toBe(0);
                expect(context.wampa.damage).toBe(3);
                expect(context.avenger.damage).toBe(0);
                expect(context.bobaFettDaimyo.damage).toBe(3);
            });

            it('should auto-select the opponent\'s only unit to not be damaged', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['time-of-crisis'],
                        groundArena: ['wampa'],
                        spaceArena: ['avenger#hunting-star-destroyer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.timeOfCrisis);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.avenger, context.bobaFettDaimyo]);
                context.player1.clickCard(context.avenger);

                expect(context.player2).toBeAbleToSelectExactly([context.atst]);
                context.player2.clickCard(context.atst);

                expect(context.atst.damage).toBe(0);
                expect(context.wampa.damage).toBe(3);
                expect(context.avenger.damage).toBe(0);
                expect(context.bobaFettDaimyo.damage).toBe(3);
            });

            it('does nothing if the board is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['time-of-crisis'],
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.timeOfCrisis);

                expect(context.timeOfCrisis).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
