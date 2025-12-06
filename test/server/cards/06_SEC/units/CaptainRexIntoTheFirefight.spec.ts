describe('Captain Rex Into the Firefight', function() {
    integration(function(contextRef) {
        describe('Captain Rex, Into the Firefight\'s ability', function() {
            it('should give Sentinel to Rex and an enemy unit when played and when completing an attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['captain-rex#into-the-firefight'],
                        groundArena: ['consular-security-force']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['strikeship'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.captainRexIntoTheFirefight);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.strikeship, context.lukeSkywalkerFaithfulFriend]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.hasSomeKeyword('sentinel')).toBeTrue();
                expect(context.captainRexIntoTheFirefight.hasSomeKeyword('sentinel')).toBeTrue();

                expect(context.player2).toBeActivePlayer();

                // Testing on attack completed
                context.moveToNextActionPhase();

                context.player1.clickCard(context.captainRexIntoTheFirefight);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.strikeship, context.lukeSkywalkerFaithfulFriend]);
                context.player1.clickCard(context.strikeship);

                expect(context.strikeship.hasSomeKeyword('sentinel')).toBeTrue();
                expect(context.captainRexIntoTheFirefight.hasSomeKeyword('sentinel')).toBeTrue();
            });

            it('should give Sentinel to Rex and an enemy leader unit when played and when completing an attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['captain-rex#into-the-firefight'],
                        groundArena: ['consular-security-force']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['strikeship'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.captainRexIntoTheFirefight);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.strikeship, context.lukeSkywalkerFaithfulFriend]);
                context.player1.clickCard(context.lukeSkywalkerFaithfulFriend);

                expect(context.lukeSkywalkerFaithfulFriend.hasSomeKeyword('sentinel')).toBeTrue();
                expect(context.captainRexIntoTheFirefight.hasSomeKeyword('sentinel')).toBeTrue();

                expect(context.player2).toBeActivePlayer();

                // Testing on attack completed
                context.moveToNextActionPhase();

                context.player1.clickCard(context.captainRexIntoTheFirefight);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.strikeship, context.lukeSkywalkerFaithfulFriend]);
                context.player1.clickCard(context.lukeSkywalkerFaithfulFriend);

                expect(context.lukeSkywalkerFaithfulFriend.hasSomeKeyword('sentinel')).toBeTrue();
                expect(context.captainRexIntoTheFirefight.hasSomeKeyword('sentinel')).toBeTrue();
            });

            it('should not trigger if the attack is not completed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['consular-security-force', 'captain-rex#into-the-firefight']
                    },
                    player2: {
                        groundArena: ['wampa', 'atat-suppressor'],
                        spaceArena: ['strikeship'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.captainRexIntoTheFirefight);
                context.player1.clickCard(context.atatSuppressor);

                expect(context.captainRexIntoTheFirefight).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to select a unit that already has sentinel', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['consular-security-force', 'captain-rex#into-the-firefight']
                    },
                    player2: {
                        groundArena: ['wampa', 'atat-suppressor'],
                        spaceArena: ['bright-hope#the-last-transport'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.captainRexIntoTheFirefight);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.brightHopeTheLastTransport, context.atatSuppressor, context.lukeSkywalkerFaithfulFriend]);
                context.player1.clickCard(context.brightHopeTheLastTransport);

                expect(context.brightHopeTheLastTransport.hasSomeKeyword('sentinel')).toBeTrue();
                expect(context.captainRexIntoTheFirefight.hasSomeKeyword('sentinel')).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});