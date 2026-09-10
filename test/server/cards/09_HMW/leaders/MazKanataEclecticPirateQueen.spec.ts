describe('Maz Kanata, Eclectic Pirate Queen', function() {
    integration(function(contextRef) {
        const abilityTitle = 'Play a Fringe or Underworld unit from your hand. It costs 1 resource less. Give a Weakness token to it';

        describe('Maz Kanata\'s leader side ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maz-kanata#eclectic-pirate-queen',
                        hand: ['moisture-farmer', 'jaxxon#i-can-hear-you-breathing', 'wampa', 'surprise-strike'],
                        base: 'lake-country',
                        resources: 10
                    },
                    player2: {}
                });
            });

            it('should play a Fringe unit from hand for 1 less, give it a Weakness token, and exhaust Maz', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.mazKanata);
                context.player1.clickPrompt(abilityTitle);

                // Only the Fringe and Underworld units in hand are selectable
                expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer, context.jaxxon]);

                context.player1.clickCard(context.moistureFarmer);

                // Moisture Farmer enters play discounted with a Weakness token, and Maz exhausts
                expect(context.moistureFarmer).toBeInZone('groundArena', context.player1);
                expect(context.moistureFarmer).toHaveExactUpgradeNames(['weakness']);
                expect(context.moistureFarmer.getPower()).toBe(0);
                expect(context.moistureFarmer.getHp()).toBe(3);
                // printed 1 + aspect penalty 2 - 1 (Maz discount) = 2
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.mazKanata.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();

                expect(context.getChatLogs(2)).toEqual([
                    'player1 uses Maz Kanata, exhausting Maz Kanata to play Moisture Farmer from their hand and give a Weakness token to it',
                    'player1 plays Moisture Farmer'
                ]);
            });

            it('should play an Underworld unit from hand for 1 less, give it a Weakness token, and exhaust Maz', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.mazKanata);
                context.player1.clickPrompt(abilityTitle);
                context.player1.clickCard(context.jaxxon);

                // Jaxxon enters play discounted with a Weakness token, and Maz exhausts
                expect(context.jaxxon).toBeInZone('groundArena', context.player1);
                expect(context.jaxxon).toHaveExactUpgradeNames(['weakness']);
                expect(context.jaxxon.getPower()).toBe(2);
                expect(context.jaxxon.getHp()).toBe(2);
                // printed 1 + aspect penalty 2 - 1 (Maz discount) = 2
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.mazKanata.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();

                expect(context.getChatLogs(2)).toEqual([
                    'player1 uses Maz Kanata, exhausting Maz Kanata to play Jaxxon from their hand and give a Weakness token to it',
                    'player1 plays Jaxxon'
                ]);
            });

            it('should not discount or give a Weakness token to a unit played through the normal Play a Card action', function() {
                const { context } = contextRef;

                // Play Moisture Farmer directly
                context.player1.clickCard(context.moistureFarmer);

                // No discount, no Weakness token, and Maz remains ready
                expect(context.moistureFarmer).toBeInZone('groundArena', context.player1);
                expect(context.moistureFarmer).toHaveExactUpgradeNames([]);

                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.mazKanata.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();

                expect(context.getChatLogs(1)).toEqual(['player1 plays Moisture Farmer']);
            });
        });

        describe('Maz Kanata\'s leader unit side ability', function() {
            describe('with eligible units in hand', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: { card: 'maz-kanata#eclectic-pirate-queen', deployed: true },
                            hand: ['jaxxon#i-can-hear-you-breathing', 'moisture-farmer', 'wampa'],
                            base: 'lake-country',
                            resources: 10
                        },
                        player2: {}
                    });
                });

                it('should play a Fringe or Underworld unit for 1 less and give it a Weakness token, without exhausting Maz', function() {
                    const { context } = contextRef;

                    // Activate Maz's ability
                    context.player1.clickCard(context.mazKanata);
                    context.player1.clickPrompt(abilityTitle);

                    // Only the Fringe and Underworld units in hand are selectable
                    expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer, context.jaxxon]);

                    context.player1.clickCard(context.jaxxon);

                    // Jaxxon enters play discounted with a Weakness token, and Maz stays ready
                    expect(context.jaxxon).toBeInZone('groundArena', context.player1);
                    expect(context.jaxxon).toHaveExactUpgradeNames(['weakness']);
                    expect(context.jaxxon.getPower()).toBe(2);
                    expect(context.jaxxon.getHp()).toBe(2);
                    expect(context.player1.exhaustedResourceCount).toBe(2);
                    expect(context.mazKanata.exhausted).toBe(false);
                    expect(context.player2).toBeActivePlayer();

                    expect(context.getChatLogs(2)).toEqual([
                        'player1 uses Maz Kanata to play Jaxxon from their hand and give a Weakness token to it',
                        'player1 plays Jaxxon'
                    ]);
                });

                it('can be used more than once in the same round', function() {
                    const { context } = contextRef;

                    // First activation
                    context.player1.clickCard(context.mazKanata);
                    context.player1.clickPrompt(abilityTitle);
                    context.player1.clickCard(context.jaxxon);

                    expect(context.jaxxon).toBeInZone('groundArena', context.player1);
                    expect(context.jaxxon).toHaveExactUpgradeNames(['weakness']);
                    expect(context.mazKanata.exhausted).toBe(false);
                    expect(context.player2).toBeActivePlayer();

                    context.player2.passAction();

                    // Second activation
                    expect(context.player1).toBeActivePlayer();
                    context.player1.clickCard(context.mazKanata);
                    context.player1.clickPrompt(abilityTitle);
                    context.player1.clickCard(context.moistureFarmer);

                    expect(context.moistureFarmer).toBeInZone('groundArena', context.player1);
                    expect(context.moistureFarmer).toHaveExactUpgradeNames(['weakness']);
                    expect(context.mazKanata.exhausted).toBe(false);

                    // Both discounted: jaxxon 1+2-1=2, moisture-farmer 1+2-1=2
                    expect(context.player1.exhaustedResourceCount).toBe(4);
                    expect(context.player2).toBeActivePlayer();

                    expect(context.getChatLogs(5)).toEqual([
                        'player1 uses Maz Kanata to play Jaxxon from their hand and give a Weakness token to it',
                        'player1 plays Jaxxon',
                        'player2 passes',
                        'player1 uses Maz Kanata to play Moisture Farmer from their hand and give a Weakness token to it',
                        'player1 plays Moisture Farmer'
                    ]);
                });
            });

            it('cannot be activated when there is no eligible Fringe or Underworld unit in hand', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'maz-kanata#eclectic-pirate-queen', deployed: true, exhausted: true },
                        hand: ['wampa', 'surprise-strike'],
                        base: 'lake-country',
                        resources: 10
                    },
                    player2: {}
                });

                const { context } = contextRef;

                // With no eligible unit in hand, Maz is not selectable
                expect(context.player1).not.toBeAbleToSelect(context.mazKanata);
            });
        });

        describe('Maz Kanata\'s cost mechanics', function() {
            it('should not allow selection of a unit that is too expensive even after the discount', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'maz-kanata#eclectic-pirate-queen', deployed: true },
                        hand: ['jaxxon#i-can-hear-you-breathing', 'hylobon-enforcer'],
                        base: 'lake-country',
                        resources: 2
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mazKanata);
                context.player1.clickPrompt(abilityTitle);

                // Jaxxon costs 1+2-1=2 (affordable with 2 resources), Hylobon costs 1+4-1=4 (too expensive)
                expect(context.player1).toBeAbleToSelectExactly([context.jaxxon]);

                context.player1.clickCard(context.jaxxon);
                expect(context.jaxxon).toBeInZone('groundArena', context.player1);
            });
        });

        describe('Units defeated on entry by the Weakness token', function() {
            it('should still trigger the When Played ability of a unit defeated by the Weakness token', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'maz-kanata#eclectic-pirate-queen', deployed: true },
                        hand: ['criminal-muscle'],
                        groundArena: [{ card: 'wampa', upgrades: ['shield'] }],
                        base: 'lake-country',
                        resources: 10
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mazKanata);
                context.player1.clickPrompt(abilityTitle);
                context.player1.clickCard(context.criminalMuscle);

                // Criminal Muscle should bounce the shield
                const shield = context.wampa.upgrades[0];
                expect(context.player1).toBeAbleToSelectExactly([shield]);
                context.player1.clickCard(shield);

                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.criminalMuscle).toBeInZone('discard', context.player1);
                expect(context.player2).toBeActivePlayer();

                expect(context.getChatLogs(4)).toEqual([
                    'player1 uses Maz Kanata to play Criminal Muscle from their hand and give a Weakness token to it',
                    'player1 plays Criminal Muscle',
                    'player1\'s Criminal Muscle is defeated by player1 due to having no remaining HP',
                    'player1 uses Criminal Muscle to return Shield to their hand'
                ]);
            });

            it('should still trigger the When Defeated ability of a unit defeated by the Weakness token', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'maz-kanata#eclectic-pirate-queen', deployed: true },
                        hand: ['rhokai-gunship'],
                        base: 'kestro-city',
                        resources: 10
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mazKanata);
                context.player1.clickPrompt(abilityTitle);
                context.player1.clickCard(context.rhokaiGunship);

                // Rhokai does 1 damage when defeated
                expect(context.player1).toBeAbleToSelectExactly([context.mazKanata, context.battlefieldMarine, context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(1);
                expect(context.rhokaiGunship).toBeInZone('discard', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player2).toBeActivePlayer();

                expect(context.getChatLogs(4)).toEqual([
                    'player1 uses Maz Kanata to play Rhokai Gunship from their hand and give a Weakness token to it',
                    'player1 plays Rhokai Gunship',
                    'player1\'s Rhokai Gunship is defeated by player1 due to having no remaining HP',
                    'player1 uses Rhokai Gunship to deal 1 damage to player2\'s base'
                ]);
            });
        });
    });
});
