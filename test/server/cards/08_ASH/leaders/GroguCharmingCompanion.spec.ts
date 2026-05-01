describe('Grogu: Charming Companion', function() {
    integration(function(contextRef) {
        describe('his triggered deploy ability', function() {
            describe('when a unique unit that costs 4 or more is played', function() {
                const deployPrompt = 'Deploy Grogu';

                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: 'grogu#charming-companion',
                            hand: ['sabine-wren#you-can-count-on-me', 'obiwan-kenobi#finding-what-doesnt-exist']
                        }
                    });
                });

                it('should allow the player to deploy Grogu', function() {
                    const { context } = contextRef;

                    // Play Sabine Wren (unique, cost 4)
                    context.player1.clickCard(context.sabineWren);

                    // Grogu's deploy ability triggers
                    expect(context.player1).toHavePassAbilityPrompt(deployPrompt);
                    context.player1.clickPrompt('Trigger');

                    // Grogu deploys to the ground arena, ready
                    expect(context.grogu).toBeInZone('groundArena');
                    expect(context.grogu.exhausted).toBeFalse();
                });

                it('should allow the player to decline deploying Grogu', function() {
                    const { context } = contextRef;

                    // Play Sabine Wren (unique, cost 4)
                    context.player1.clickCard(context.sabineWren);

                    // Grogu's deploy ability triggers — decline
                    expect(context.player1).toHavePassAbilityPrompt(deployPrompt);
                    context.player1.clickPrompt('Pass');

                    // Grogu remains on leader side, and stays ready (not in the ground arena)
                    expect(context.grogu).not.toBeInZone('groundArena');
                    expect(context.grogu.exhausted).toBeFalse();
                    expect(context.player2).toBeActivePlayer();
                });

                it('should trigger again on a second unique unit play after declining the first', function() {
                    const { context } = contextRef;

                    // Play first unique unit, decline deploy
                    context.player1.clickCard(context.sabineWren);
                    expect(context.player1).toHavePassAbilityPrompt(deployPrompt);
                    context.player1.clickPrompt('Pass');

                    expect(context.grogu).not.toBeInZone('groundArena');
                    expect(context.grogu.exhausted).toBeFalse();

                    context.player2.passAction();

                    // Play second unique unit, accept deploy
                    context.player1.clickCard(context.obiwanKenobi);
                    expect(context.player1).toHavePassAbilityPrompt(deployPrompt);
                    context.player1.clickPrompt('Trigger');

                    // Grogu deploys to the ground arena, ready
                    expect(context.grogu).toBeInZone('groundArena');
                    expect(context.grogu.exhausted).toBeFalse();
                });
            });

            it('should NOT trigger when a non-unique unit costing 4 is played', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grogu#charming-companion',
                        hand: ['wampa'],
                        resources: 4
                    }
                });

                const { context } = contextRef;

                // Wampa: non-unique, cost 4 — does not satisfy the unique condition
                context.player1.clickCard(context.wampa);

                expect(context.grogu).not.toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should NOT trigger when a unique unit costing 3 is played', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grogu#charming-companion',
                        hand: ['bodhi-rook#imperial-defector'], // unique, cost 3 — below the cost threshold
                        resources: 6
                    }
                });

                const { context } = contextRef;

                // Bodhi Rook: unique, cost 3 — below the cost threshold
                context.player1.clickCard(context.bodhiRook);

                expect(context.grogu).not.toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger when a unique unit costing 5 is played', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grogu#charming-companion',
                        hand: ['chewbacca#loyal-companion'], // unique, cost 5 — above the minimum threshold
                        resources: 10
                    }
                });

                const { context } = contextRef;

                // Chewbacca: unique, cost 5
                context.player1.clickCard(context.chewbacca);

                expect(context.player1).toHavePassAbilityPrompt('Deploy Grogu');
                context.player1.clickPrompt('Trigger');

                expect(context.grogu).toBeInZone('groundArena');
                expect(context.grogu.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should NOT trigger when Grogu is exhausted', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grogu#charming-companion', exhausted: true },
                        hand: ['sabine-wren#you-can-count-on-me'],
                        resources: 10
                    }
                });

                const { context } = contextRef;

                // Grogu is exhausted — the condition blocks the triggered ability
                context.player1.clickCard(context.sabineWren);

                expect(context.grogu).not.toBeInZone('groundArena');
                expect(context.grogu.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should NOT trigger when the opponent plays a unique unit costing 4', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grogu#charming-companion'
                    },
                    player2: {
                        hand: ['sabine-wren#you-can-count-on-me'],
                        resources: 10
                    }
                });

                const { context } = contextRef;

                // The ability only fires when player1 (Grogu's controller) plays the card
                context.player1.passAction();
                context.player2.clickCard(context.sabineWren);

                expect(context.grogu).not.toBeInZone('groundArena');
                expect(context.grogu.exhausted).toBeFalse();
                expect(context.player1).toBeActivePlayer();
            });

            it('should NOT trigger when a unique upgrade costing 4 is played', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grogu#charming-companion',
                        hand: ['the-darksaber'], // unique, cost 4, upgrade — should not satisfy the "unit" condition
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // The Darksaber is unique and costs 4, but it is an upgrade, not a unit
                context.player1.clickCard(context.theDarksaber);
                context.player1.clickCard(context.wampa);

                expect(context.grogu).not.toBeInZone('groundArena');
                expect(context.grogu.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('his leader unit side ability: +1/+0 to defending friendly units', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grogu#charming-companion', deployed: true },
                        groundArena: ['wilderness-fighter'] // 2/4, no keywords — will be attacked
                    },
                    player2: {
                        groundArena: ['death-trooper'], // 3/3 — the attacker
                        hasInitiative: true
                    }
                });
            });

            it('should give +1/+0 to a friendly unit while it is defending', function() {
                const { context } = contextRef;

                // Death trooper attacks Wilderness Fighter while Grogu is deployed
                context.player2.clickCard(context.deathTrooper);
                context.player2.clickCard(context.wildernessFighter);

                // Wilderness fighter gets +1/+0, enough to defeat the Death Trooper in combat
                expect(context.deathTrooper).toBeInZone('discard');
                expect(context.wildernessFighter).toBeInZone('groundArena');
                expect(context.wildernessFighter.damage).toBe(3);
            });

            it('should NOT give +1/+0 to Grogu himself when he is defending', function() {
                const { context } = contextRef;

                // Death Trooper attacks Grogu directly
                context.player2.clickCard(context.deathTrooper);
                context.player2.clickCard(context.grogu);

                // Death Trooper survives with no damage
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toBe(0);

                // Grogu is defeated by combat damage and flips to leader side
                expect(context.grogu).toBeInZone('base');
                expect(context.grogu.exhausted).toBeTrue();
            });
        });

        describe('his leader unit side ability: -1/-0 to the defending enemy unit', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grogu#charming-companion', deployed: true },
                        groundArena: ['battlefield-marine'] // 3/3 — the attacker
                    },
                    player2: {
                        groundArena: ['death-trooper'] // 3/3 — the defender
                    }
                });
            });

            it('should give the defending enemy -1/-0 when a friendly non-Grogu unit is attacking', function() {
                const { context } = contextRef;

                // Battlefield Marine (3/3) attacks Death Trooper (3/3).
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.deathTrooper);

                // Battlefield Marine survives because Death Trooper got -1/-0 for the attack
                expect(context.deathTrooper).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.battlefieldMarine.damage).toBe(2);
            });

            it('should NOT give -1/-0 to the defending enemy when Grogu himself is attacking', function() {
                const { context } = contextRef;

                // Grogu (0/3) attacks Death Trooper (3/3).
                context.player1.clickCard(context.grogu);
                context.player1.clickCard(context.deathTrooper);

                // Death Trooper survives with no damage
                expect(context.deathTrooper).toBeInZone('groundArena');
                expect(context.deathTrooper.damage).toBe(0);

                // Grogu is defeated because Death Trooper did not get the debuff
                expect(context.grogu).toBeInZone('base');
                expect(context.grogu.exhausted).toBeTrue();
            });
        });
    });
});
