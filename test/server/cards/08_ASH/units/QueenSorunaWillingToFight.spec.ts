describe('Queen Soruna, Willing to Fight', function() {
    integration(function(contextRef) {
        describe('its When Played/On Attack ability', function() {
            describe('When Played', function() {
                describe('with units and valid targets in play', function() {
                    beforeEach(async function() {
                        await contextRef.setupTestAsync({
                            phase: 'action',
                            player1: {
                                hand: ['queen-soruna#willing-to-fight', 'wampa', 'echo-base-defender', 'shoot-first', 'electrostaff'], // costs 4, 3, event, upgrade
                                spaceArena: ['resistance-blue-squadron'], // costs 4
                                resources: 10
                            },
                            player2: {
                                groundArena: ['consular-security-force', 'atst'] // costs 4, 6
                            }
                        });
                    });

                    it('should deal 3 damage to an enemy unit with the same cost as the revealed unit', function() {
                        const { context } = contextRef;

                        context.player1.clickCard(context.queenSoruna);

                        // Ability triggers — select the unit from hand to reveal
                        expect(context.player1).toHavePassAbilityButton();
                        expect(context.player1).toHavePrompt('Reveal a unit from your hand');

                        // Non-units in hand aren't selectable
                        expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.echoBaseDefender]);

                        context.player1.clickCard(context.wampa);

                        // Opponent dismisses the card display after viewing the revealed unit
                        context.player2.clickDone();

                        // Validate Chatlog message for revealed card
                        expect(context.getChatLogs()).toEqual([
                            'player1 uses Queen Soruna to reveal Wampa'
                        ]);

                        // After revealing wampa (cost 4), must target a unit with cost 4
                        expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.resistanceBlueSquadron]);
                        context.player1.clickCard(context.consularSecurityForce);

                        // 3 damage dealt to the matching-cost unit
                        expect(context.consularSecurityForce.damage).toBe(3);
                        expect(context.player2).toBeActivePlayer();
                    });

                    it('should deal 3 damage to a friendly unit with the same cost as the revealed unit', function() {
                        const { context } = contextRef;

                        context.player1.clickCard(context.queenSoruna);

                        // Ability triggers — select the unit from hand to reveal
                        expect(context.player1).toHavePassAbilityButton();
                        expect(context.player1).toHavePrompt('Reveal a unit from your hand');

                        // Non-units in hand aren't selectable
                        expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.echoBaseDefender]);

                        context.player1.clickCard(context.wampa);

                        // Opponent dismisses the card display after viewing the revealed unit
                        context.player2.clickDone();

                        // After revealing wampa (cost 4), must target a unit with cost 4
                        expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.resistanceBlueSquadron]);
                        context.player1.clickCard(context.resistanceBlueSquadron);

                        // 3 damage dealt to the matching-cost unit
                        expect(context.resistanceBlueSquadron.damage).toBe(3);
                        expect(context.player2).toBeActivePlayer();
                    });

                    it('should deal no damage when the player declines to reveal a unit', function() {
                        const { context } = contextRef;

                        context.player1.clickCard(context.queenSoruna);

                        // Pass
                        expect(context.player1).toHavePassAbilityButton();
                        context.player1.clickPrompt('Pass');

                        expect(context.player2).toBeActivePlayer();
                    });
                });

                it('should deal no damage when there are no valid targets matching the revealed unit cost', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['queen-soruna#willing-to-fight', 'echo-base-defender'], // echo-base-defender costs 3
                            resources: 10
                        },
                        player2: {
                            groundArena: ['wampa'] // wampa costs 4
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.queenSoruna);

                    // Ability triggers — select the unit from hand to reveal
                    expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender]);
                    context.player1.clickCard(context.echoBaseDefender);

                    context.player2.clickDone();

                    // No cost-3 units in play, ability fizzles
                    expect(context.wampa.damage).toBe(0);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should not prompt when player has no units in hand', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: [
                                'queen-soruna#willing-to-fight',
                                'shoot-first' // only an event, no units
                            ],
                            resources: 10
                        },
                        player2: {
                            groundArena: ['wampa']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.queenSoruna);

                    expect(context.player2).toBeActivePlayer();
                });

                it('should not prompt when player has no cards in hand', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: [
                                'queen-soruna#willing-to-fight'
                            ],
                            resources: 10
                        },
                        player2: {
                            groundArena: ['wampa']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.queenSoruna);

                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('On Attack', function() {
                describe('with units and valid targets in play', function() {
                    beforeEach(async function() {
                        await contextRef.setupTestAsync({
                            phase: 'action',
                            player1: {
                                hand: ['wampa', 'echo-base-defender', 'shoot-first', 'electrostaff'], // costs 4, 3, event, upgrade
                                groundArena: ['queen-soruna#willing-to-fight'],
                                spaceArena: ['resistance-blue-squadron'], // costs 4
                                resources: 10
                            },
                            player2: {
                                groundArena: ['consular-security-force', 'atst'] // costs 4, 6
                            }
                        });
                    });

                    it('should deal 3 damage to an enemy unit with the same cost as the revealed unit', function() {
                        const { context } = contextRef;

                        context.player1.clickCard(context.queenSoruna);
                        context.player1.clickCard(context.p2Base); // declare attack

                        // Ability triggers — select the unit from hand to reveal
                        expect(context.player1).toHavePassAbilityButton();
                        expect(context.player1).toHavePrompt('Reveal a unit from your hand');

                        // Non-units in hand aren't selectable
                        expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.echoBaseDefender]);

                        context.player1.clickCard(context.wampa);

                        // Opponent dismisses the card display after viewing the revealed unit
                        context.player2.clickDone();

                        // Validate Chatlog message for revealed card
                        expect(context.getChatLogs()).toEqual([
                            'player1 uses Queen Soruna to reveal Wampa'
                        ]);

                        // After revealing wampa (cost 4), must target a unit with cost 4
                        expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.resistanceBlueSquadron]);
                        context.player1.clickCard(context.consularSecurityForce);

                        // 3 damage dealt to the matching-cost unit, 5 to base
                        expect(context.consularSecurityForce.damage).toBe(3);
                        expect(context.p2Base.damage).toBe(5);
                        expect(context.player2).toBeActivePlayer();
                    });

                    it('should deal 3 damage to a friendly unit with the same cost as the revealed unit', function() {
                        const { context } = contextRef;

                        context.player1.clickCard(context.queenSoruna);
                        context.player1.clickCard(context.p2Base);

                        // Ability triggers — select the unit from hand to reveal
                        expect(context.player1).toHavePassAbilityButton();
                        expect(context.player1).toHavePrompt('Reveal a unit from your hand');

                        // Non-units in hand aren't selectable
                        expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.echoBaseDefender]);

                        context.player1.clickCard(context.wampa);

                        // Opponent dismisses the card display after viewing the revealed unit
                        context.player2.clickDone();

                        // After revealing wampa (cost 4), must target a unit with cost 4
                        expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.resistanceBlueSquadron]);
                        context.player1.clickCard(context.resistanceBlueSquadron);

                        // 3 damage dealt to the matching-cost unit
                        expect(context.resistanceBlueSquadron.damage).toBe(3);
                        expect(context.p2Base.damage).toBe(5);
                        expect(context.player2).toBeActivePlayer();
                    });

                    it('should deal no damage when the player declines to reveal a unit', function() {
                        const { context } = contextRef;

                        context.player1.clickCard(context.queenSoruna);
                        context.player1.clickCard(context.p2Base);

                        // Pass
                        expect(context.player1).toHavePassAbilityButton();
                        context.player1.clickPrompt('Pass');

                        expect(context.p2Base.damage).toBe(5);
                        expect(context.player2).toBeActivePlayer();
                    });
                });

                it('should deal no damage when there are no valid targets matching the revealed unit cost', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['echo-base-defender'], // echo-base-defender costs 3
                            groundArena: ['queen-soruna#willing-to-fight'],
                            resources: 10
                        },
                        player2: {
                            groundArena: ['wampa'] // wampa costs 4
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.queenSoruna);
                    context.player1.clickCard(context.p2Base);

                    // Ability triggers — select the unit from hand to reveal
                    expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender]);
                    context.player1.clickCard(context.echoBaseDefender);

                    context.player2.clickDone();

                    // No cost-3 units in play, ability fizzles
                    expect(context.wampa.damage).toBe(0);
                    expect(context.p2Base.damage).toBe(5);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should not prompt when player has no units in hand', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['shoot-first'], // only an event, no units
                            groundArena: ['queen-soruna#willing-to-fight'],
                            resources: 10
                        },
                        player2: {
                            groundArena: ['wampa']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.queenSoruna);
                    context.player1.clickCard(context.p2Base);

                    expect(context.p2Base.damage).toBe(5);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should not prompt when player has no cards in hand', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: ['queen-soruna#willing-to-fight'],
                            resources: 10
                        },
                        player2: {
                            groundArena: ['wampa']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.queenSoruna);
                    context.player1.clickCard(context.p2Base);

                    expect(context.p2Base.damage).toBe(5);
                    expect(context.player2).toBeActivePlayer();
                });
            });
        });
    });
});
