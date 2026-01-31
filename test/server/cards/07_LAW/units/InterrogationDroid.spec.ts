describe('Interrogation Droid', function() {
    integration(function(contextRef) {
        describe('Interrogation Droid\'s ability', function() {
            it('should exhaust an enemy unit and discard if it costs 3 or less', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['interrogation-droid'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: [{ card: 'green-squadron-awing', exhausted: true }]
                    },
                    player2: {
                        groundArena: [{ card: 'pyke-sentinel', exhausted: true }, 'wampa'],
                        spaceArena: ['lurking-tie-phantom'],
                        hand: ['daring-raid', 'surprise-strike'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.interrogationDroid);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel, context.lurkingTiePhantom]);

                context.player1.clickCard(context.lurkingTiePhantom);
                expect(context.player2).toBeAbleToSelectExactly([context.daringRaid, context.surpriseStrike]);

                context.player2.clickCard(context.daringRaid);
                expect(context.lurkingTiePhantom.exhausted).toBe(true);
                expect(context.daringRaid).toBeInZone('discard');
            });

            it('should not discard if the exhausted unit is already exhausted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['interrogation-droid'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: [{ card: 'green-squadron-awing', exhausted: true }]
                    },
                    player2: {
                        groundArena: [{ card: 'pyke-sentinel', exhausted: true }, 'wampa'],
                        spaceArena: ['lurking-tie-phantom'],
                        hand: ['daring-raid', 'surprise-strike'],
                        leader: 'luke-skywalker#faithful-friend'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.interrogationDroid);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel, context.lurkingTiePhantom]);

                context.player1.clickCard(context.pykeSentinel);
                expect(context.player2).not.toHavePrompt('Choose a card to discard for Interrogation Droid\'s effect');

                expect(context.pykeSentinel.exhausted).toBe(true);
                expect(context.daringRaid).toBeInZone('hand');
                expect(context.surpriseStrike).toBeInZone('hand');
            });

            it('should not discard if the unit costs more than 3', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['interrogation-droid'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: [{ card: 'green-squadron-awing', exhausted: true }]
                    },
                    player2: {
                        groundArena: [{ card: 'pyke-sentinel', exhausted: true }, 'wampa'],
                        spaceArena: ['lurking-tie-phantom'],
                        hand: ['daring-raid', 'surprise-strike'],
                        leader: 'luke-skywalker#faithful-friend'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.interrogationDroid);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel, context.lurkingTiePhantom]);

                context.player1.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.daringRaid, context.surpriseStrike, context.lukeSkywalkerFaithfulFriend, context.lurkingTiePhantom]);

                expect(context.wampa.exhausted).toBe(true);
                expect(context.daringRaid).toBeInZone('hand');
                expect(context.surpriseStrike).toBeInZone('hand');
            });

            it('should not discard if there are no enemy units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['interrogation-droid'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: [{ card: 'green-squadron-awing', exhausted: true }]
                    },
                    player2: {
                        hand: ['daring-raid', 'surprise-strike'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.interrogationDroid);
                expect(context.player2).toHaveEnabledPromptButton('Claim Initiative');
                expect(context.player2).toHaveEnabledPromptButton('Pass');

                expect(context.daringRaid).toBeInZone('hand');
                expect(context.surpriseStrike).toBeInZone('hand');
            });
        });
    });
});