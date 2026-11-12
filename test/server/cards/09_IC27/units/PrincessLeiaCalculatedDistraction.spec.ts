describe('Princess Leia, Calculated Distraction', function() {
    integration(function(contextRef) {
        describe('Princess Leia\'s When Played ability', function() {
            describe('with units in both arenas', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['princess-leia#calculated-distraction'],
                            leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }, // cost 4
                            groundArena: ['battlefield-marine', 'wampa', 'cantina-braggart'], // costs 2, 4, 1
                            spaceArena: ['alliance-xwing'] // cost 2
                        },
                        player2: {
                            leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }, // cost 5
                            groundArena: ['yoda#old-master', 'atst', 'battle-droid', 'isb-agent', 'pyke-sentinel'], // costs 3, 6, 0, 1, 2
                            spaceArena: ['green-squadron-awing'] // cost 2
                        }
                    });
                });

                it('should exhaust two ground units with combined cost 4, one enemy and one friendly', function() {
                    const { context } = contextRef;

                    // Play Leia, all units with cost 4 or less are selectable (not Leia (5), AT-ST (6) or Tarkin (5))
                    context.player1.clickCard(context.princessLeia);
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.sabineWren,
                        context.battlefieldMarine,
                        context.wampa,
                        context.cantinaBraggart,
                        context.allianceXwing,
                        context.yoda,
                        context.battleDroid,
                        context.isbAgent,
                        context.pykeSentinel,
                        context.greenSquadronAwing
                    ]);
                    expect(context.player1).toHaveChooseNothingButton();

                    // Choose a 2-cost friendly unit, only same-arena units that fit the remaining cost are selectable
                    context.player1.clickCard(context.battlefieldMarine);
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.battlefieldMarine,
                        context.cantinaBraggart,
                        context.battleDroid,
                        context.isbAgent,
                        context.pykeSentinel
                    ]);

                    // Choose a 2-cost enemy unit and confirm
                    context.player1.clickCard(context.pykeSentinel);
                    context.player1.clickDone();

                    // Only the two chosen units are exhausted
                    expect(context.battlefieldMarine.exhausted).toBeTrue();
                    expect(context.pykeSentinel.exhausted).toBeTrue();
                    expect(context.battleDroid.exhausted).toBeFalse();
                    expect(context.wampa.exhausted).toBeFalse();
                    expect(context.cantinaBraggart.exhausted).toBeFalse();
                    expect(context.player2).toBeActivePlayer();
                });

                it('should only allow same-arena units that keep the combined cost at 4 or less after choosing a 3-cost unit', function() {
                    const { context } = contextRef;

                    // Play Leia and choose Yoda (cost 3)
                    context.player1.clickCard(context.princessLeia);
                    context.player1.clickCard(context.yoda);

                    // Only ground units costing 1 or less remain (a 2-cost unit would exceed 4)
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.yoda,
                        context.cantinaBraggart,
                        context.battleDroid,
                        context.isbAgent
                    ]);

                    // Choose a 1-cost unit and confirm
                    context.player1.clickCard(context.cantinaBraggart);
                    context.player1.clickDone();

                    // Only the two chosen units are exhausted
                    expect(context.yoda.exhausted).toBeTrue();
                    expect(context.cantinaBraggart.exhausted).toBeTrue();
                    expect(context.isbAgent.exhausted).toBeFalse();
                    expect(context.battleDroid.exhausted).toBeFalse();
                    expect(context.player2).toBeActivePlayer();
                });

                it('should not allow selecting space units after choosing a ground unit', function() {
                    const { context } = contextRef;

                    // Play Leia and choose Cantina Braggart (cost 1)
                    context.player1.clickCard(context.princessLeia);
                    context.player1.clickCard(context.cantinaBraggart);

                    // Ground units costing 3 or less remain, no space units
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.battlefieldMarine,
                        context.cantinaBraggart,
                        context.yoda,
                        context.battleDroid,
                        context.isbAgent,
                        context.pykeSentinel
                    ]);

                    // Choose Yoda and confirm
                    context.player1.clickCard(context.yoda);
                    context.player1.clickDone();

                    // Only the two ground units are exhausted
                    expect(context.cantinaBraggart.exhausted).toBeTrue();
                    expect(context.yoda.exhausted).toBeTrue();
                    expect(context.allianceXwing.exhausted).toBeFalse();
                    expect(context.greenSquadronAwing.exhausted).toBeFalse();
                    expect(context.player2).toBeActivePlayer();
                });

                it('should allow exhausting two space units even though Leia is in the ground arena', function() {
                    const { context } = contextRef;

                    // Play Leia and choose an enemy space unit
                    context.player1.clickCard(context.princessLeia);
                    context.player1.clickCard(context.greenSquadronAwing);

                    // Only space units remain
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.greenSquadronAwing,
                        context.allianceXwing
                    ]);

                    // Choose a friendly space unit and confirm
                    context.player1.clickCard(context.allianceXwing);
                    context.player1.clickDone();

                    // Both space units are exhausted, ground units are not
                    expect(context.greenSquadronAwing.exhausted).toBeTrue();
                    expect(context.allianceXwing.exhausted).toBeTrue();
                    expect(context.battlefieldMarine.exhausted).toBeFalse();
                    expect(context.player2).toBeActivePlayer();
                });

                it('should allow exhausting a single 4-cost unit, after which only 0-cost units remain selectable', function() {
                    const { context } = contextRef;

                    // Play Leia and choose Wampa (cost 4)
                    context.player1.clickCard(context.princessLeia);
                    context.player1.clickCard(context.wampa);

                    // Only the 0-cost unit remains selectable
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.wampa,
                        context.battleDroid
                    ]);

                    // Confirm with only Wampa chosen
                    context.player1.clickDone();

                    // Only Wampa is exhausted
                    expect(context.wampa.exhausted).toBeTrue();
                    expect(context.battleDroid.exhausted).toBeFalse();
                    expect(context.player2).toBeActivePlayer();
                });

                it('should allow exhausting a 0-cost token unit together with a 4-cost unit', function() {
                    const { context } = contextRef;

                    // Play Leia, choose Wampa (cost 4) and Battle Droid (cost 0), then confirm
                    context.player1.clickCard(context.princessLeia);
                    context.player1.clickCard(context.wampa);
                    context.player1.clickCard(context.battleDroid);
                    context.player1.clickDone();

                    // Both units are exhausted
                    expect(context.wampa.exhausted).toBeTrue();
                    expect(context.battleDroid.exhausted).toBeTrue();
                    expect(context.player2).toBeActivePlayer();
                });

                it('should count the printed cost of a deployed leader unit toward the cap', function() {
                    const { context } = contextRef;

                    // Play Leia, all units with cost 4 or less are selectable
                    context.player1.clickCard(context.princessLeia);
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.sabineWren,
                        context.battlefieldMarine,
                        context.wampa,
                        context.cantinaBraggart,
                        context.allianceXwing,
                        context.yoda,
                        context.battleDroid,
                        context.isbAgent,
                        context.pykeSentinel,
                        context.greenSquadronAwing
                    ]);

                    // Choose Sabine's leader unit (cost 4), so only 0-cost units can be added
                    context.player1.clickCard(context.sabineWren);
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.sabineWren,
                        context.battleDroid
                    ]);

                    // Confirm with only Sabine chosen
                    context.player1.clickDone();

                    // Only Sabine is exhausted
                    expect(context.sabineWren.exhausted).toBeTrue();
                    expect(context.battleDroid.exhausted).toBeFalse();
                    expect(context.player2).toBeActivePlayer();
                });

                it('should allow choosing nothing', function() {
                    const { context } = contextRef;

                    // Play Leia, the choose nothing button is available
                    context.player1.clickCard(context.princessLeia);
                    expect(context.player1).toHaveChooseNothingButton();

                    // Choose nothing
                    context.player1.clickDone();

                    // No units are exhausted
                    expect(context.sabineWren.exhausted).toBeFalse();
                    expect(context.battlefieldMarine.exhausted).toBeFalse();
                    expect(context.wampa.exhausted).toBeFalse();
                    expect(context.yoda.exhausted).toBeFalse();
                    expect(context.player2).toBeActivePlayer();
                });
            });

            it('should allow selecting an already-exhausted unit and count its cost toward the cap', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['princess-leia#calculated-distraction'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', exhausted: true }, 'cantina-braggart']
                    }
                });

                const { context } = contextRef;

                // Play Leia, the exhausted Wampa is selectable
                context.player1.clickCard(context.princessLeia);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.wampa,
                    context.cantinaBraggart
                ]);
                expect(context.player1).toHaveChooseNothingButton();

                // Choose the exhausted Wampa (cost 4), so nothing else can be added
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickDone();

                // Wampa remains exhausted, other units are untouched
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.cantinaBraggart.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Princess Leia\'s On Attack ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['princess-leia#calculated-distraction', 'cantina-braggart']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'battle-droid', 'atst']
                    }
                });
            });

            it('should exhaust the defender and another unit, and the exhausted defender still deals combat damage', function() {
                const { context } = contextRef;

                // Leia attacks Battlefield Marine
                context.player1.clickCard(context.princessLeia);
                context.player1.clickCard(context.battlefieldMarine);

                // Ability triggers, Leia (5) and AT-ST (6) are not selectable
                expect(context.player1).toBeAbleToSelectExactly([
                    context.cantinaBraggart,
                    context.battlefieldMarine,
                    context.battleDroid
                ]);
                expect(context.player1).toHaveChooseNothingButton();

                // Exhaust the defender and Battle Droid
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.battleDroid);
                context.player1.clickDone();
                expect(context.battleDroid.exhausted).toBeTrue();

                // The exhausted defender still deals combat damage and is defeated by Leia's 5 power
                expect(context.princessLeia.damage).toBe(3);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger when attacking the base and allow exhausting a unit', function() {
                const { context } = contextRef;

                // Leia attacks the enemy base
                context.player1.clickCard(context.princessLeia);
                context.player1.clickCard(context.p2Base);

                // Ability triggers, Leia (5) and AT-ST (6) are not selectable
                expect(context.player1).toBeAbleToSelectExactly([
                    context.cantinaBraggart,
                    context.battlefieldMarine,
                    context.battleDroid
                ]);
                expect(context.player1).toHaveChooseNothingButton();

                // Exhaust Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickDone();

                // Only Battlefield Marine is exhausted, base takes damage
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.battleDroid.exhausted).toBeFalse();
                expect(context.p2Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
