describe('Fiery Alliance', function() {
    integration(function(contextRef) {
        describe('Fiery Alliance\'s when played ability', function() {
            it('should deal 1 damage to another friendly ground unit and attack with it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fiery-alliance'],
                        groundArena: ['battlefield-marine', 'death-star-stormtrooper', 'clan-challengers'],
                        spaceArena: ['cartel-spacer', { card: 'zygerrian-starhopper', exhausted: true }]
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['strikeship']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.fieryAlliance);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.deathStarStormtrooper,
                    context.clanChallengers,
                    context.cartelSpacer,
                    context.zygerrianStarhopper,
                    context.wampa,
                    context.strikeship
                ]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.deathStarStormtrooper,
                    context.cartelSpacer,
                    context.clanChallengers,
                    context.zygerrianStarhopper
                ]);

                context.player1.clickCard(context.clanChallengers);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(6);
                expect(context.clanChallengers.damage).toBe(1);
            });

            it('should deal 1 damage to another friendly space unit and attack with it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fiery-alliance'],
                        groundArena: ['battlefield-marine', 'death-star-stormtrooper'],
                        spaceArena: ['cartel-spacer', { card: 'zygerrian-starhopper', exhausted: true }]
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['strikeship']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.fieryAlliance);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.deathStarStormtrooper,
                    context.cartelSpacer,
                    context.zygerrianStarhopper,
                    context.wampa,
                    context.strikeship
                ]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.cartelSpacer, context.zygerrianStarhopper]);

                context.player1.clickCard(context.cartelSpacer);
                expect(context.player1).toBeAbleToSelectExactly([context.strikeship, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(2);
                expect(context.cartelSpacer.damage).toBe(1);
            });

            it('should not bug out if you kill your unit with the ping', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fiery-alliance'],
                        groundArena: ['battlefield-marine', 'death-star-stormtrooper'],
                        spaceArena: ['cartel-spacer', { card: 'zygerrian-starhopper', exhausted: true }]
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['strikeship']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.fieryAlliance);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.deathStarStormtrooper,
                    context.cartelSpacer,
                    context.zygerrianStarhopper,
                    context.wampa,
                    context.strikeship
                ]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.cartelSpacer, context.zygerrianStarhopper]);

                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(0);
                expect(context.deathStarStormtrooper).toBeInZone('discard');
            });

            it('should be able to be passed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fiery-alliance'],
                        groundArena: ['battlefield-marine', 'death-star-stormtrooper'],
                        spaceArena: ['cartel-spacer', { card: 'zygerrian-starhopper', exhausted: true }]
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['strikeship']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.fieryAlliance);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.deathStarStormtrooper,
                    context.cartelSpacer,
                    context.zygerrianStarhopper,
                    context.wampa,
                    context.strikeship
                ]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.cartelSpacer, context.zygerrianStarhopper]);
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.zygerrianStarhopper.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.deathStarStormtrooper.damage).toBe(0);
            });

            it('should still work if the upgrade is played on an enemy unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fiery-alliance'],
                        groundArena: ['battlefield-marine', 'death-star-stormtrooper'],
                        spaceArena: ['cartel-spacer', { card: 'zygerrian-starhopper', exhausted: true }]
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['strikeship']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.fieryAlliance);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.deathStarStormtrooper,
                    context.cartelSpacer,
                    context.zygerrianStarhopper,
                    context.wampa,
                    context.strikeship
                ]);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.deathStarStormtrooper,
                    context.cartelSpacer,
                    context.battlefieldMarine,
                    context.zygerrianStarhopper
                ]);

                context.player1.clickCard(context.cartelSpacer);
                expect(context.player1).toBeAbleToSelectExactly([context.strikeship, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(2);
                expect(context.cartelSpacer.damage).toBe(1);
            });

            it('should do as much as you can if selecting an exhausted unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fiery-alliance'],
                        groundArena: ['battlefield-marine', 'death-star-stormtrooper'],
                        spaceArena: ['cartel-spacer', { card: 'zygerrian-starhopper', exhausted: true }]
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['strikeship']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.fieryAlliance);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.deathStarStormtrooper,
                    context.cartelSpacer,
                    context.zygerrianStarhopper,
                    context.wampa,
                    context.strikeship
                ]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.deathStarStormtrooper,
                    context.cartelSpacer,
                    context.zygerrianStarhopper
                ]);

                context.player1.clickCard(context.zygerrianStarhopper);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(0);
                expect(context.zygerrianStarhopper.damage).toBe(1);
            });
        });
    });
});