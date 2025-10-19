describe('The Elite Squad, Neutralizing Insurgents', function() {
    integration(function(contextRef) {
        describe('The Elite Squad, Neutralizing Insurgents\'s ability', function() {
            it('should allow dealing damage to a unique leader when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-elite-squad#neutralizing-insurgents'],
                        groundArena: ['darth-vader#commanding-the-first-legion']
                    },
                    player2: {
                        groundArena: ['grand-inquisitor#youre-right-to-be-afraid'],
                        spaceArena: ['bright-hope#the-last-transport', 'strikeship'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theEliteSquadNeutralizingInsurgents);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthVaderCommandingTheFirstLegion,
                    context.grandInquisitorYoureRightToBeAfraid,
                    context.lukeSkywalkerFaithfulFriend,
                    context.brightHopeTheLastTransport]);
                context.player1.clickCard(context.lukeSkywalkerFaithfulFriend);

                expect(context.lukeSkywalkerFaithfulFriend.damage).toBe(2);
                expect(context.theEliteSquadNeutralizingInsurgents.damage).toBe(0);
                expect(context.darthVaderCommandingTheFirstLegion.damage).toBe(0);
                expect(context.grandInquisitorYoureRightToBeAfraid.damage).toBe(0);
                expect(context.brightHopeTheLastTransport.damage).toBe(0);
                expect(context.strikeship.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow dealing damage to a unique ground unit when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-elite-squad#neutralizing-insurgents'],
                        groundArena: ['darth-vader#commanding-the-first-legion']
                    },
                    player2: {
                        groundArena: ['grand-inquisitor#youre-right-to-be-afraid'],
                        spaceArena: ['bright-hope#the-last-transport', 'strikeship'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theEliteSquadNeutralizingInsurgents);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthVaderCommandingTheFirstLegion,
                    context.grandInquisitorYoureRightToBeAfraid,
                    context.lukeSkywalkerFaithfulFriend,
                    context.brightHopeTheLastTransport]);
                context.player1.clickCard(context.grandInquisitorYoureRightToBeAfraid);

                expect(context.lukeSkywalkerFaithfulFriend.damage).toBe(0);
                expect(context.theEliteSquadNeutralizingInsurgents.damage).toBe(0);
                expect(context.darthVaderCommandingTheFirstLegion.damage).toBe(0);
                expect(context.grandInquisitorYoureRightToBeAfraid.damage).toBe(2);
                expect(context.brightHopeTheLastTransport.damage).toBe(0);
                expect(context.strikeship.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow dealing damage to a unique space unit when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-elite-squad#neutralizing-insurgents'],
                        groundArena: ['darth-vader#commanding-the-first-legion']
                    },
                    player2: {
                        groundArena: ['grand-inquisitor#youre-right-to-be-afraid'],
                        spaceArena: ['bright-hope#the-last-transport', 'strikeship'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theEliteSquadNeutralizingInsurgents);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthVaderCommandingTheFirstLegion,
                    context.grandInquisitorYoureRightToBeAfraid,
                    context.lukeSkywalkerFaithfulFriend,
                    context.brightHopeTheLastTransport]);
                context.player1.clickCard(context.brightHopeTheLastTransport);

                expect(context.lukeSkywalkerFaithfulFriend.damage).toBe(0);
                expect(context.theEliteSquadNeutralizingInsurgents.damage).toBe(0);
                expect(context.darthVaderCommandingTheFirstLegion.damage).toBe(0);
                expect(context.grandInquisitorYoureRightToBeAfraid.damage).toBe(0);
                expect(context.brightHopeTheLastTransport.damage).toBe(2);
                expect(context.strikeship.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow dealing damage to a friendly unique ground unit when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-elite-squad#neutralizing-insurgents'],
                        groundArena: ['darth-vader#commanding-the-first-legion']
                    },
                    player2: {
                        groundArena: ['grand-inquisitor#youre-right-to-be-afraid'],
                        spaceArena: ['bright-hope#the-last-transport', 'strikeship'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theEliteSquadNeutralizingInsurgents);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthVaderCommandingTheFirstLegion,
                    context.grandInquisitorYoureRightToBeAfraid,
                    context.lukeSkywalkerFaithfulFriend,
                    context.brightHopeTheLastTransport]);
                context.player1.clickCard(context.darthVaderCommandingTheFirstLegion);

                expect(context.lukeSkywalkerFaithfulFriend.damage).toBe(0);
                expect(context.theEliteSquadNeutralizingInsurgents.damage).toBe(0);
                expect(context.darthVaderCommandingTheFirstLegion.damage).toBe(2);
                expect(context.grandInquisitorYoureRightToBeAfraid.damage).toBe(0);
                expect(context.brightHopeTheLastTransport.damage).toBe(0);
                expect(context.strikeship.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to be passed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-elite-squad#neutralizing-insurgents'],
                        groundArena: ['darth-vader#commanding-the-first-legion']
                    },
                    player2: {
                        groundArena: ['grand-inquisitor#youre-right-to-be-afraid'],
                        spaceArena: ['bright-hope#the-last-transport', 'strikeship'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theEliteSquadNeutralizingInsurgents);

                context.player1.clickPrompt('Pass');

                expect(context.lukeSkywalkerFaithfulFriend.damage).toBe(0);
                expect(context.theEliteSquadNeutralizingInsurgents.damage).toBe(0);
                expect(context.darthVaderCommandingTheFirstLegion.damage).toBe(0);
                expect(context.grandInquisitorYoureRightToBeAfraid.damage).toBe(0);
                expect(context.brightHopeTheLastTransport.damage).toBe(0);
                expect(context.strikeship.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow dealing damage to a friendly unique ground unit when damaged by an event', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-vader#commanding-the-first-legion', 'the-elite-squad#neutralizing-insurgents']
                    },
                    player2: {
                        hand: ['daring-raid', 'torpedo-barrage'],
                        groundArena: ['grand-inquisitor#youre-right-to-be-afraid'],
                        spaceArena: ['bright-hope#the-last-transport', 'strikeship'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.theEliteSquadNeutralizingInsurgents);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthVaderCommandingTheFirstLegion,
                    context.grandInquisitorYoureRightToBeAfraid,
                    context.lukeSkywalkerFaithfulFriend,
                    context.brightHopeTheLastTransport]);
                context.player1.clickCard(context.darthVaderCommandingTheFirstLegion);

                expect(context.lukeSkywalkerFaithfulFriend.damage).toBe(0);
                expect(context.theEliteSquadNeutralizingInsurgents.damage).toBe(2);
                expect(context.darthVaderCommandingTheFirstLegion.damage).toBe(2);
                expect(context.grandInquisitorYoureRightToBeAfraid.damage).toBe(0);
                expect(context.brightHopeTheLastTransport.damage).toBe(0);
                expect(context.strikeship.damage).toBe(0);

                expect(context.player1).toBeActivePlayer();
            });

            it('should allow dealing damage to a unique ground unit when damaged by attacking', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-vader#commanding-the-first-legion', 'the-elite-squad#neutralizing-insurgents']
                    },
                    player2: {
                        hand: ['daring-raid', 'torpedo-barrage'],
                        groundArena: ['grand-inquisitor#youre-right-to-be-afraid', 'fifth-brother#fear-hunter'],
                        spaceArena: ['bright-hope#the-last-transport', 'strikeship'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theEliteSquadNeutralizingInsurgents);
                context.player1.clickCard(context.grandInquisitorYoureRightToBeAfraid);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthVaderCommandingTheFirstLegion,
                    context.fifthBrotherFearHunter,
                    context.lukeSkywalkerFaithfulFriend,
                    context.brightHopeTheLastTransport]);
                context.player1.clickCard(context.fifthBrotherFearHunter);

                expect(context.lukeSkywalkerFaithfulFriend.damage).toBe(0);
                expect(context.theEliteSquadNeutralizingInsurgents.damage).toBe(3);
                expect(context.darthVaderCommandingTheFirstLegion.damage).toBe(0);
                expect(context.fifthBrotherFearHunter.damage).toBe(2);
                expect(context.brightHopeTheLastTransport.damage).toBe(0);
                expect(context.strikeship.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow dealing damage to a unique ground unit when damaged by defending', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-vader#commanding-the-first-legion', 'the-elite-squad#neutralizing-insurgents']
                    },
                    player2: {
                        hand: ['daring-raid', 'torpedo-barrage'],
                        groundArena: ['grand-inquisitor#youre-right-to-be-afraid', 'fifth-brother#fear-hunter'],
                        spaceArena: ['bright-hope#the-last-transport', 'strikeship'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.grandInquisitorYoureRightToBeAfraid);
                context.player2.clickCard(context.theEliteSquadNeutralizingInsurgents);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthVaderCommandingTheFirstLegion,
                    context.fifthBrotherFearHunter,
                    context.lukeSkywalkerFaithfulFriend,
                    context.brightHopeTheLastTransport]);
                context.player1.clickCard(context.fifthBrotherFearHunter);

                expect(context.lukeSkywalkerFaithfulFriend.damage).toBe(0);
                expect(context.theEliteSquadNeutralizingInsurgents.damage).toBe(4);
                expect(context.darthVaderCommandingTheFirstLegion.damage).toBe(0);
                expect(context.fifthBrotherFearHunter.damage).toBe(2);
                expect(context.brightHopeTheLastTransport.damage).toBe(0);
                expect(context.strikeship.damage).toBe(0);

                expect(context.player1).toBeActivePlayer();
            });

            it('should allow dealing damage to a unique ground unit when damaged by indirect damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-vader#commanding-the-first-legion', 'the-elite-squad#neutralizing-insurgents']
                    },
                    player2: {
                        hand: ['daring-raid', 'torpedo-barrage'],
                        groundArena: ['grand-inquisitor#youre-right-to-be-afraid', 'fifth-brother#fear-hunter'],
                        spaceArena: ['bright-hope#the-last-transport', 'strikeship'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.torpedoBarrage);
                context.player2.clickPrompt('Deal indirect damage to opponent');

                expect(context.player1).toBeAbleToSelectExactly([context.darthVaderCommandingTheFirstLegion, context.theEliteSquadNeutralizingInsurgents, context.p1Base]);
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.setDistributeIndirectDamagePromptState(new Map([
                    [context.theEliteSquadNeutralizingInsurgents, 5],
                ]));

                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthVaderCommandingTheFirstLegion,
                    context.fifthBrotherFearHunter,
                    context.grandInquisitorYoureRightToBeAfraid,
                    context.lukeSkywalkerFaithfulFriend,
                    context.brightHopeTheLastTransport]);
                context.player1.clickCard(context.fifthBrotherFearHunter);

                expect(context.lukeSkywalkerFaithfulFriend.damage).toBe(0);
                expect(context.theEliteSquadNeutralizingInsurgents.damage).toBe(5);
                expect(context.darthVaderCommandingTheFirstLegion.damage).toBe(0);
                expect(context.grandInquisitorYoureRightToBeAfraid.damage).toBe(0);
                expect(context.fifthBrotherFearHunter.damage).toBe(2);
                expect(context.brightHopeTheLastTransport.damage).toBe(0);
                expect(context.strikeship.damage).toBe(0);

                expect(context.player1).toBeActivePlayer();
            });

            it('should allow dealing damage to a unique ground unit even if the damage defeats the unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-vader#commanding-the-first-legion', 'the-elite-squad#neutralizing-insurgents']
                    },
                    player2: {
                        hand: ['daring-raid', 'torpedo-barrage'],
                        groundArena: ['krayt-dragon', 'fifth-brother#fear-hunter'],
                        spaceArena: ['bright-hope#the-last-transport', 'strikeship'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.kraytDragon);
                context.player2.clickCard(context.theEliteSquadNeutralizingInsurgents);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthVaderCommandingTheFirstLegion,
                    context.fifthBrotherFearHunter,
                    context.lukeSkywalkerFaithfulFriend,
                    context.brightHopeTheLastTransport]);
                context.player1.clickCard(context.fifthBrotherFearHunter);

                expect(context.lukeSkywalkerFaithfulFriend.damage).toBe(0);
                expect(context.theEliteSquadNeutralizingInsurgents).toBeInZone('discard');
                expect(context.darthVaderCommandingTheFirstLegion.damage).toBe(0);
                expect(context.fifthBrotherFearHunter.damage).toBe(2);
                expect(context.brightHopeTheLastTransport.damage).toBe(0);
                expect(context.kraytDragon.damage).toBe(6);
                expect(context.strikeship.damage).toBe(0);

                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger if there are no valid targets', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-elite-squad#neutralizing-insurgents']
                    },
                    player2: {
                        hand: ['daring-raid', 'torpedo-barrage'],
                        groundArena: ['krayt-dragon', 'fifth-brother#fear-hunter'],
                        spaceArena: ['strikeship'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theEliteSquadNeutralizingInsurgents);
                context.player1.clickCard(context.fifthBrotherFearHunter);

                expect(context.theEliteSquadNeutralizingInsurgents.damage).toBe(2);
                expect(context.fifthBrotherFearHunter).toBeInZone('discard');
                expect(context.kraytDragon.damage).toBe(0);
                expect(context.strikeship.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});