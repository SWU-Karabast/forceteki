describe('Cal Kestis, I Can\'t Keep Hiding', function () {
    integration(function (contextRef) {
        describe('Cal Kestis\'s Leader side ability', function () {
            it('allows opponent to choose and exhaust one of their ready units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cal-kestis#i-cant-keep-hiding',
                        spaceArena: ['green-squadron-awing'],
                        hasForceToken: true,
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', exhausted: true }, 'battlefield-marine'],
                        spaceArena: ['tie-advanced'],
                    },
                });

                const { context } = contextRef;

                // Use Cal Kestis's ability
                context.player1.clickCard(context.calKestis);
                context.player1.clickPrompt('An opponent chooses a ready unit they control. Exhaust that unit');

                // Verify Cal Kestis is exhausted and The Force is used
                expect(context.calKestis.exhausted).toBeTrue();
                expect(context.player1.hasTheForce).toBeFalse();

                // Verify opponent can only select ready units
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.tieAdvanced]);

                // Opponent selects a unit to exhaust
                context.player2.clickCard(context.battlefieldMarine);

                // Verify the unit is exhausted
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('can be used if opponent has no ready units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cal-kestis#i-cant-keep-hiding',
                        hasForceToken: true,
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', exhausted: true }],
                    },
                });

                const { context } = contextRef;

                // Exhaust the opponent's only unit
                context.wampa.exhaust();

                // Use Cal Kestis's ability
                context.player1.clickCard(context.calKestis);
                context.player1.clickPrompt('An opponent chooses a ready unit they control. Exhaust that unit');
                context.player1.clickPrompt('Use it anyway');

                // Verify Cal Kestis is exhausted and The Force is used
                expect(context.calKestis.exhausted).toBeTrue();
                expect(context.player1.hasTheForce).toBeFalse();

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Cal Kestis\'s Unit side ability', function () {
            it('allows opponent to choose and exhaust one of their ready units when attacking', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cal-kestis#i-cant-keep-hiding', deployed: true },
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', exhausted: true }, 'battlefield-marine'],
                        spaceArena: ['tie-advanced'],
                    },
                });

                const { context } = contextRef;

                // Attack with Cal Kestis
                context.player1.clickCard(context.calKestis);
                context.player1.clickCard(context.p2Base);

                // Verify opponent can only select ready units
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.tieAdvanced]);

                // Opponent selects a unit to exhaust
                context.player2.clickCard(context.tieAdvanced);

                // Verify the unit is exhausted
                expect(context.tieAdvanced.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger if opponent has no ready units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cal-kestis#i-cant-keep-hiding', deployed: true },
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', exhausted: true }],
                    },
                });

                const { context } = contextRef;

                // Attack with Cal Kestis
                context.player1.clickCard(context.calKestis);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});