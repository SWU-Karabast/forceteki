describe('Red Leader, Strike the Reactor', function() {
    integration(function(contextRef) {
        describe('its cross-arena attack ability', function() {
            it('should allow Red Leader to attack units in either arena from the space arena', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['red-leader#strike-the-reactor']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                const { context } = contextRef;

                // Red Leader can attack both arenas and the base
                context.player1.clickCard(context.redLeader);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.p2Base]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');
            });

            it('should allow a friendly ground unit chosen via Support to attack enemy units in either arena', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['red-leader#strike-the-reactor'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                // Play Red Leader, triggering Support
                context.player1.clickCard(context.redLeader);

                // Support: Wampa is the only friendly unit
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                // Wampa gains cross-arena attack for this attack
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.tielnFighter,
                    context.p2Base
                ]);

                // TIE/ln Fighter (1 HP) is defeated by Wampa (4 power)
                context.player1.clickCard(context.tielnFighter);
                expect(context.tielnFighter).toBeInZone('discard');
            });

            it('should allow a friendly space unit chosen via Support to attack enemy units in either arena', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['red-leader#strike-the-reactor'],
                        spaceArena: ['stolen-athauler']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                // Play Red Leader, triggering Support
                context.player1.clickCard(context.redLeader);

                // Support: Stolen AT-Hauler is the only friendly unit
                expect(context.player1).toBeAbleToSelectExactly([context.stolenAthauler]);
                context.player1.clickCard(context.stolenAthauler);

                // Stolen AT-Hauler gains cross-arena attack for this attack
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.tielnFighter,
                    context.p2Base
                ]);

                // Battlefield Marine (3 HP) is defeated by Stolen AT-Hauler (4 power)
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');
            });

            it('should not restrict Red Leader\'s targeting when a Sentinel is only in the other arena', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['red-leader#strike-the-reactor']
                    },
                    player2: {
                        groundArena: ['echo-base-defender', 'battlefield-marine'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                // Red Leader is in the space arena and there's no Sentinel in space —
                // the ground Sentinel doesn't restrict targeting from the other arena.
                context.player1.clickCard(context.redLeader);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.tielnFighter,
                    context.p2Base,
                    context.echoBaseDefender,
                    context.battlefieldMarine
                ]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');
            });

            it('should not restrict a ground unit chosen via Support when a Sentinel is only in the space arena', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['red-leader#strike-the-reactor'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['alkenzi-patroller', 'tieln-fighter']
                    }
                });

                const { context } = contextRef;

                // Play Red Leader, triggering Support — Wampa is the only friendly unit
                context.player1.clickCard(context.redLeader);
                context.player1.clickCard(context.wampa);

                // Wampa is in the ground arena and there's no Sentinel in ground —
                // the space Sentinel doesn't restrict targeting from the other arena.
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.p2Base,
                    context.alkenziPatroller,
                    context.tielnFighter,
                ]);

                context.player1.clickCard(context.tielnFighter);
                expect(context.tielnFighter).toBeInZone('discard');
            });

            it('should restrict Red Leader to attacking only Sentinels in either arena when a Sentinel is in its arena', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['red-leader#strike-the-reactor']
                    },
                    player2: {
                        groundArena: ['echo-base-defender', 'battlefield-marine'],
                        spaceArena: ['alkenzi-patroller', 'tieln-fighter']
                    }
                });

                const { context } = contextRef;

                // Red Leader is in the space arena. A Sentinel in its arena restricts every target
                // (including cross-arena) to Sentinels only, per the Strafing Gunship dev ruling.
                context.player1.clickCard(context.redLeader);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.alkenziPatroller,
                    context.echoBaseDefender
                ]);

                context.player1.clickCard(context.echoBaseDefender);
                expect(context.echoBaseDefender).toBeInZone('discard');
            });

            it('should restrict a ground unit chosen via Support to only Sentinels in either arena when a Sentinel is in the ground arena', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['red-leader#strike-the-reactor'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['echo-base-defender', 'battlefield-marine'],
                        spaceArena: ['alkenzi-patroller', 'tieln-fighter']
                    }
                });

                const { context } = contextRef;

                // Play Red Leader, triggering Support — Wampa is the only friendly unit
                context.player1.clickCard(context.redLeader);
                context.player1.clickCard(context.wampa);

                // Wampa is in the ground arena, so the ground Sentinel restricts every target
                // (including cross-arena to space) to Sentinels only.
                expect(context.player1).toBeAbleToSelectExactly([
                    context.echoBaseDefender,
                    context.alkenziPatroller
                ]);

                context.player1.clickCard(context.alkenziPatroller);
                expect(context.alkenziPatroller).toBeInZone('discard');
            });

            it('should allow a Saboteur space unit chosen via Support to attack any enemy unit or the base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['red-leader#strike-the-reactor'],
                        spaceArena: ['ohnaka-gang-starhopper']
                    },
                    player2: {
                        groundArena: ['echo-base-defender', 'battlefield-marine'],
                        spaceArena: ['alkenzi-patroller', 'tieln-fighter']
                    }
                });

                const { context } = contextRef;

                // Play Red Leader, triggering Support — Ohnaka Gang Starhopper is the only friendly unit
                context.player1.clickCard(context.redLeader);
                context.player1.clickCard(context.ohnakaGangStarhopper);

                // Saboteur ignores Sentinel, and Red Leader's ability adds cross-arena attack —
                // so any enemy unit and the base are valid targets.
                expect(context.player1).toBeAbleToSelectExactly([
                    context.alkenziPatroller,
                    context.tielnFighter,
                    context.echoBaseDefender,
                    context.battlefieldMarine,
                    context.p2Base
                ]);

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
            });

            it('should allow a Saboteur ground unit chosen via Support to attack any enemy unit or the base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['red-leader#strike-the-reactor'],
                        groundArena: ['reckless-rebel']
                    },
                    player2: {
                        groundArena: ['echo-base-defender', 'battlefield-marine'],
                        spaceArena: ['alkenzi-patroller', 'tieln-fighter']
                    }
                });

                const { context } = contextRef;

                // Play Red Leader, triggering Support — Reckless Rebel is the only friendly unit
                context.player1.clickCard(context.redLeader);
                context.player1.clickCard(context.recklessRebel);

                // Saboteur ignores Sentinel, and Red Leader's ability adds cross-arena attack —
                // so any enemy unit and the base are valid targets.
                expect(context.player1).toBeAbleToSelectExactly([
                    context.echoBaseDefender,
                    context.battlefieldMarine,
                    context.alkenziPatroller,
                    context.tielnFighter,
                    context.p2Base
                ]);

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
            });

            it('should not grant the supported unit cross-arena attack on subsequent attacks', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['red-leader#strike-the-reactor'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer', 'tieln-fighter']
                    }
                });

                const { context } = contextRef;

                // Play Red Leader, triggering Support — Wampa attacks the base to preserve all units
                context.player1.clickCard(context.redLeader);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer).toBeInZone('discard');

                // Advance to next action phase so Wampa readies
                context.moveToNextActionPhase();

                // Wampa (ground) can only attack ground targets — cross-arena was for the Support attack only
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.p2Base]);

                context.player1.clickCard(context.p2Base);
            });
        });
    });
});
