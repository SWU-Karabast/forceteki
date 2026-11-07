describe('Jyn Erso, Her Father\'s Revenge', function() {
    integration(function(contextRef) {
        describe('Jyn Erso\'s When Played ability', function() {
            describe('with units in both arenas', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['jyn-erso#her-fathers-revenge'], // cost 8
                            leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }, // cost 4
                            groundArena: [
                                { card: 'battlefield-marine', exhausted: true }, // cost 2
                                { card: 'wampa', exhausted: true }, // cost 4
                                'cantina-braggart', // cost 1
                                { card: 'luke-skywalker#jedi-knight', exhausted: true } // cost 7
                            ],
                            spaceArena: [{ card: 'alliance-xwing', exhausted: true }] // cost 2
                        },
                        player2: {
                            leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }, // cost 5
                            groundArena: [
                                { card: 'blizzard-assault-atat', exhausted: true }, // cost 8
                                { card: 'yoda#old-master', exhausted: true }, // cost 3
                                { card: 'battle-droid', exhausted: true }, // cost 0
                                'clone-trooper', // cost 0
                                'pyke-sentinel' // cost 2
                            ]
                        }
                    });
                });

                // Every unit with cost 7 or less, friendly and enemy (excludes Jyn (8) and Blizzard Assault AT-AT (8))
                const getInitialSelectableUnits = () => {
                    const { context } = contextRef;
                    return [
                        context.sabineWren,
                        context.battlefieldMarine,
                        context.wampa,
                        context.cantinaBraggart,
                        context.lukeSkywalker,
                        context.allianceXwing,
                        context.grandMoffTarkin,
                        context.yoda,
                        context.battleDroid,
                        context.cloneTrooper,
                        context.pykeSentinel
                    ];
                };

                it('should ready up to 3 units with combined cost 7 or less and give each Saboteur for the phase', function() {
                    const { context } = contextRef;

                    // Play Jyn, all units with cost 7 or less are selectable
                    context.player1.clickCard(context.jynErsoHerFathersRevenge);
                    expect(context.player1).toBeAbleToSelectExactly(getInitialSelectableUnits());
                    expect(context.player1).toHaveChooseNothingButton();

                    // Choose Battlefield Marine (2) and Wampa (4), leaving 1 cost: only 0 and 1 cost units can be added, and chosen units stay selectable to deselect
                    context.player1.clickCard(context.battlefieldMarine);
                    context.player1.clickCard(context.wampa);
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.battlefieldMarine,
                        context.wampa,
                        context.cantinaBraggart,
                        context.battleDroid,
                        context.cloneTrooper
                    ]);

                    // Choose an enemy 0-cost unit and confirm
                    context.player1.clickCard(context.battleDroid);
                    context.player1.clickDone();

                    // The three chosen units are readied and have Saboteur
                    expect(context.battlefieldMarine.exhausted).toBeFalse();
                    expect(context.wampa.exhausted).toBeFalse();
                    expect(context.battleDroid.exhausted).toBeFalse();
                    expect(context.battlefieldMarine.hasSomeKeyword('saboteur')).toBeTrue();
                    expect(context.wampa.hasSomeKeyword('saboteur')).toBeTrue();
                    expect(context.battleDroid.hasSomeKeyword('saboteur')).toBeTrue();

                    // Other units are untouched
                    expect(context.yoda.exhausted).toBeTrue();
                    expect(context.allianceXwing.exhausted).toBeTrue();
                    expect(context.lukeSkywalker.exhausted).toBeTrue();
                    expect(context.cantinaBraggart.hasSomeKeyword('saboteur')).toBeFalse();
                    expect(context.yoda.hasSomeKeyword('saboteur')).toBeFalse();
                    expect(context.player2).toBeActivePlayer();
                });

                it('should only allow units that keep the combined cost at 7 or less after choosing a 5-cost unit', function() {
                    const { context } = contextRef;

                    // Play Jyn and choose Tarkin's leader unit (cost 5)
                    context.player1.clickCard(context.jynErsoHerFathersRevenge);
                    context.player1.clickCard(context.grandMoffTarkin);

                    // Only units costing 2 or less remain (a 3-cost unit would exceed 7)
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.grandMoffTarkin,
                        context.battlefieldMarine,
                        context.cantinaBraggart,
                        context.allianceXwing,
                        context.battleDroid,
                        context.cloneTrooper,
                        context.pykeSentinel
                    ]);

                    // Choose a 2-cost unit and confirm
                    context.player1.clickCard(context.pykeSentinel);
                    context.player1.clickDone();

                    // Tarkin and Pyke Sentinel are readied and gain Saboteur, others are untouched
                    expect(context.grandMoffTarkin.hasSomeKeyword('saboteur')).toBeTrue();
                    expect(context.pykeSentinel.exhausted).toBeFalse();
                    expect(context.pykeSentinel.hasSomeKeyword('saboteur')).toBeTrue();
                    expect(context.battlefieldMarine.exhausted).toBeTrue();
                    expect(context.battlefieldMarine.hasSomeKeyword('saboteur')).toBeFalse();
                    expect(context.player2).toBeActivePlayer();
                });

                it('should never allow selecting a unit of cost 8 or more, including Jyn herself', function() {
                    const { context } = contextRef;

                    // Play Jyn, she is in play but costs 8, so neither she nor Blizzard Assault AT-AT (8) is selectable
                    context.player1.clickCard(context.jynErsoHerFathersRevenge);
                    expect(context.jynErsoHerFathersRevenge).toBeInZone('groundArena');
                    expect(context.player1).toBeAbleToSelectExactly(getInitialSelectableUnits());

                    // Choose Luke (cost 7), so only 0-cost units can be added
                    context.player1.clickCard(context.lukeSkywalker);
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.lukeSkywalker,
                        context.battleDroid,
                        context.cloneTrooper
                    ]);
                    context.player1.clickDone();

                    // Only Luke is readied
                    expect(context.lukeSkywalker.exhausted).toBeFalse();
                    expect(context.lukeSkywalker.hasSomeKeyword('saboteur')).toBeTrue();
                    expect(context.battleDroid.exhausted).toBeTrue();
                    expect(context.blizzardAssaultAtat.exhausted).toBeTrue();
                    expect(context.player2).toBeActivePlayer();
                });

                it('should count the printed cost of a deployed leader unit toward the cap', function() {
                    const { context } = contextRef;

                    // Play Jyn, the deployed leader unit is selectable like any other unit
                    context.player1.clickCard(context.jynErsoHerFathersRevenge);
                    expect(context.player1).toBeAbleToSelectExactly(getInitialSelectableUnits());

                    // Choose Sabine's leader unit (cost 4), so only units costing 3 or less remain
                    context.player1.clickCard(context.sabineWren);
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.sabineWren,
                        context.battlefieldMarine,
                        context.cantinaBraggart,
                        context.allianceXwing,
                        context.yoda,
                        context.battleDroid,
                        context.cloneTrooper,
                        context.pykeSentinel
                    ]);

                    // Choose Yoda (cost 3) and confirm
                    context.player1.clickCard(context.yoda);
                    context.player1.clickDone();

                    // Sabine and Yoda gain Saboteur and Yoda is readied
                    expect(context.yoda.exhausted).toBeFalse();
                    expect(context.yoda.hasSomeKeyword('saboteur')).toBeTrue();
                    expect(context.sabineWren.hasSomeKeyword('saboteur')).toBeTrue();
                    expect(context.player2).toBeActivePlayer();
                });

                it('should allow selecting an already-ready unit, leave it ready, and still give it Saboteur', function() {
                    const { context } = contextRef;

                    // Play Jyn, the already-ready Cantina Braggart is selectable
                    context.player1.clickCard(context.jynErsoHerFathersRevenge);
                    expect(context.player1).toBeAbleToSelectExactly(getInitialSelectableUnits());
                    expect(context.cantinaBraggart.exhausted).toBeFalse();
                    expect(context.cantinaBraggart.hasSomeKeyword('saboteur')).toBeFalse();

                    // Choose the ready Cantina Braggart (1) and the exhausted Battlefield Marine (2), then confirm
                    context.player1.clickCard(context.cantinaBraggart);
                    context.player1.clickCard(context.battlefieldMarine);
                    context.player1.clickDone();

                    // Braggart stays ready and gains Saboteur, Marine is readied and gains Saboteur
                    expect(context.cantinaBraggart.exhausted).toBeFalse();
                    expect(context.cantinaBraggart.hasSomeKeyword('saboteur')).toBeTrue();
                    expect(context.battlefieldMarine.exhausted).toBeFalse();
                    expect(context.battlefieldMarine.hasSomeKeyword('saboteur')).toBeTrue();
                    expect(context.player2).toBeActivePlayer();
                });

                it('should allow choosing nothing', function() {
                    const { context } = contextRef;

                    // Play Jyn, the choose nothing button is available
                    context.player1.clickCard(context.jynErsoHerFathersRevenge);
                    expect(context.player1).toHaveChooseNothingButton();

                    // Choose nothing
                    context.player1.clickDone();

                    // Nothing is readied and no Saboteur is granted (Jyn keeps her printed Saboteur)
                    expect(context.battlefieldMarine.exhausted).toBeTrue();
                    expect(context.wampa.exhausted).toBeTrue();
                    expect(context.yoda.exhausted).toBeTrue();
                    expect(context.battlefieldMarine.hasSomeKeyword('saboteur')).toBeFalse();
                    expect(context.cantinaBraggart.hasSomeKeyword('saboteur')).toBeFalse();
                    expect(context.cloneTrooper.hasSomeKeyword('saboteur')).toBeFalse();
                    expect(context.jynErsoHerFathersRevenge.hasSomeKeyword('saboteur')).toBeTrue();
                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('with 0-cost units', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['jyn-erso#her-fathers-revenge'], // cost 8
                            groundArena: [
                                { card: 'battle-droid', exhausted: true }, // cost 0
                                { card: 'luke-skywalker#jedi-knight', exhausted: true } // cost 7
                            ]
                        },
                        player2: {
                            groundArena: [
                                { card: 'clone-trooper', exhausted: true }, // cost 0
                                { card: 'spy', exhausted: true } // cost 0
                            ]
                        }
                    });
                });

                it('should allow choosing three 0-cost token units', function() {
                    const { context } = contextRef;

                    // Play Jyn, every unit is selectable since each costs 7 or less
                    context.player1.clickCard(context.jynErsoHerFathersRevenge);
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.battleDroid,
                        context.lukeSkywalker,
                        context.cloneTrooper,
                        context.spy
                    ]);

                    // Choose all three 0-cost tokens and confirm
                    context.player1.clickCard(context.battleDroid);
                    context.player1.clickCard(context.cloneTrooper);
                    context.player1.clickCard(context.spy);
                    context.player1.clickDone();

                    // The three tokens are readied and have Saboteur, Luke is untouched
                    expect(context.battleDroid.exhausted).toBeFalse();
                    expect(context.cloneTrooper.exhausted).toBeFalse();
                    expect(context.spy.exhausted).toBeFalse();
                    expect(context.lukeSkywalker.exhausted).toBeTrue();
                    expect(context.battleDroid.hasSomeKeyword('saboteur')).toBeTrue();
                    expect(context.cloneTrooper.hasSomeKeyword('saboteur')).toBeTrue();
                    expect(context.spy.hasSomeKeyword('saboteur')).toBeTrue();
                    expect(context.player2).toBeActivePlayer();
                });

                it('should allow choosing a 0-cost token alongside a 7-cost unit', function() {
                    const { context } = contextRef;

                    // Play Jyn and choose Luke (cost 7), so only 0-cost units can be added
                    context.player1.clickCard(context.jynErsoHerFathersRevenge);
                    context.player1.clickCard(context.lukeSkywalker);
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.lukeSkywalker,
                        context.battleDroid,
                        context.cloneTrooper,
                        context.spy
                    ]);

                    // Choose a 0-cost token and confirm
                    context.player1.clickCard(context.spy);
                    context.player1.clickDone();

                    // Luke and Spy are readied and have Saboteur, other tokens are untouched
                    expect(context.lukeSkywalker.exhausted).toBeFalse();
                    expect(context.spy.exhausted).toBeFalse();
                    expect(context.battleDroid.exhausted).toBeTrue();
                    expect(context.cloneTrooper.exhausted).toBeTrue();
                    expect(context.lukeSkywalker.hasSomeKeyword('saboteur')).toBeTrue();
                    expect(context.spy.hasSomeKeyword('saboteur')).toBeTrue();
                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('granted Saboteur', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['jyn-erso#her-fathers-revenge'], // cost 8
                            groundArena: [{ card: 'battlefield-marine', exhausted: true }] // cost 2
                        },
                        player2: {
                            groundArena: [
                                'pyke-sentinel', // cost 2, Sentinel
                                { card: 'yoda#old-master', upgrades: ['shield'] } // cost 3
                            ]
                        }
                    });
                });

                it('should let a readied unit attack past a Sentinel and defeat the defender\'s Shield', function() {
                    const { context } = contextRef;

                    // Play Jyn and ready Battlefield Marine, all three units fit under the cap
                    context.player1.clickCard(context.jynErsoHerFathersRevenge);
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.battlefieldMarine,
                        context.pykeSentinel,
                        context.yoda
                    ]);
                    context.player1.clickCard(context.battlefieldMarine);
                    context.player1.clickDone();
                    expect(context.battlefieldMarine.exhausted).toBeFalse();
                    expect(context.battlefieldMarine.hasSomeKeyword('saboteur')).toBeTrue();

                    // Marine attacks, Saboteur lets it ignore the Sentinel
                    context.player2.passAction();
                    context.player1.clickCard(context.battlefieldMarine);
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.pykeSentinel,
                        context.yoda,
                        context.p2Base
                    ]);
                    context.player1.clickCard(context.yoda);

                    // Yoda's Shield is defeated before damage, so Yoda takes the full 3 damage
                    expect(context.yoda).toHaveExactUpgradeNames([]);
                    expect(context.yoda.damage).toBe(3);
                    expect(context.battlefieldMarine.damage).toBe(2);
                });

                it('should lose the granted Saboteur at the end of the phase', function() {
                    const { context } = contextRef;

                    // Play Jyn and ready Battlefield Marine
                    context.player1.clickCard(context.jynErsoHerFathersRevenge);
                    context.player1.clickCard(context.battlefieldMarine);
                    context.player1.clickDone();
                    expect(context.battlefieldMarine.hasSomeKeyword('saboteur')).toBeTrue();

                    // Move to the next phase
                    context.moveToNextActionPhase();

                    // Marine no longer has Saboteur, Jyn keeps her printed one
                    expect(context.battlefieldMarine.hasSomeKeyword('saboteur')).toBeFalse();
                    expect(context.jynErsoHerFathersRevenge.hasSomeKeyword('saboteur')).toBeTrue();

                    // Sentinel restriction applies again: Marine can only attack the Sentinel
                    context.player1.clickCard(context.battlefieldMarine);
                    expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel]);

                    // Resolve the attack so the phase ends with no open prompt
                    context.player1.clickCard(context.pykeSentinel);
                    expect(context.p2Base.damage).toBe(0);
                });
            });
        });
    });
});
