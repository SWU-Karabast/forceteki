describe('The Mandalorian\'s Rifle', function () {
    integration(function (contextRef) {
        describe('The Mandalorian\'s Rifle\'s ability', function () {
            it('should not capture anyone because attached unit is not The Mandalorian', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-mandalorians-rifle'],
                        groundArena: ['the-mandalorian#wherever-i-go-he-goes', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['wampa', { card: 'atst', exhausted: true }, { card: 'scout-bike-pursuer', exhausted: true }],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMandaloriansRifle);

                // able to choose non-vehicle friendly unit
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.theMandalorian]);
                context.player1.clickCard(context.battlefieldMarine);

                // not the mandalorian, nothing happen
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.atst).toBeInZone('groundArena');
                expect(context.scoutBikePursuer).toBeInZone('groundArena');

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.theMandalorian).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should capture an exhausted enemy unit because attached unit is The Mandalorian (unit)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-mandalorians-rifle'],
                        groundArena: ['the-mandalorian#wherever-i-go-he-goes', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa', { card: 'atst', exhausted: true }, { card: 'scout-bike-pursuer', exhausted: true }],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMandaloriansRifle);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.theMandalorian]);

                context.player1.clickCard(context.theMandalorian);

                // should capture an exhausted enemy unit
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.scoutBikePursuer]);
                context.player1.clickCard(context.atst);

                expect(context.atst).toBeCapturedBy(context.theMandalorian);
                expect(context.player2).toBeActivePlayer();
            });

            it('should capture an exhausted enemy unit because attached unit is The Mandalorian (leader)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-mandalorians-rifle'],
                        groundArena: ['battlefield-marine'],
                        leader: { card: 'the-mandalorian#sworn-to-the-creed', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa', { card: 'atst', exhausted: true }, { card: 'scout-bike-pursuer', exhausted: true }],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMandaloriansRifle);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.theMandalorian]);
                context.player1.clickCard(context.theMandalorian);

                // should capture an exhausted enemy unit
                context.player1.clickPrompt('If attached unit is The Mandalorian, he captures an exhausted enemy non-leader unit');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.scoutBikePursuer]);
                context.player1.clickCard(context.atst);

                expect(context.atst).toBeCapturedBy(context.theMandalorian);

                // pass mandalorian leader ability
                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
