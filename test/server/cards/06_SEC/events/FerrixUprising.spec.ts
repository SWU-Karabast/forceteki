describe('Ferrix Uprising', function() {
    integration(function(contextRef) {
        describe('Ferrix Uprising\'s ability', function() {
            it('should deal damage equal to twice the number of units you control in the target\'s arena', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ferrix-uprising'],
                        groundArena: ['battlefield-marine', 'clone-trooper'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['consular-security-force'], // 6 HP unit, will take 4 damage and survive
                        spaceArena: ['hyperspace-wayfarer']
                    }
                });
                const { context } = contextRef;

                // Play Ferrix Uprising
                context.player1.clickCard(context.ferrixUprising);

                // Should be able to select any unit
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.cloneTrooper,
                    context.greenSquadronAwing,
                    context.consularSecurityForce,
                    context.hyperspaceWayfarer
                ]);

                // Select ground arena unit - should deal 4 damage (2 × 2 ground units)
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(4);
            });

            it('should count units in space arena when targeting a space unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ferrix-uprising'],
                        groundArena: ['battlefield-marine', 'clone-trooper'],
                        spaceArena: ['green-squadron-awing', 'tieln-fighter']
                    },
                    player2: {
                        spaceArena: ['hyperspace-wayfarer']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.ferrixUprising);

                // Select space arena unit - should deal 4 damage (2 × 2 space units)
                context.player1.clickCard(context.hyperspaceWayfarer);
                expect(context.hyperspaceWayfarer.damage).toBe(4);
            });

            it('should deal 0 damage if you control no units in the target\'s arena', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ferrix-uprising'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        spaceArena: ['hyperspace-wayfarer']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.ferrixUprising);

                // Select space unit when you have no space units - should deal 0 damage
                context.player1.clickCard(context.hyperspaceWayfarer);
                expect(context.hyperspaceWayfarer.damage).toBe(0);
            });

            it('should only count units in the same arena as the target', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ferrix-uprising'],
                        groundArena: ['battlefield-marine', 'clone-trooper', 'wampa'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.ferrixUprising);

                // Select ground unit - should deal 6 damage (2 × 3 ground units), ignoring the 1 space unit
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(6);
            });

            it('should be able to target your own units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ferrix-uprising'],
                        groundArena: ['consular-security-force', 'clone-trooper'] // Only 2 units, will deal 4 damage
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.ferrixUprising);

                // Can target own units - should deal 4 damage (2 × 2 ground units)
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(4);
            });

            it('should defeat a unit if damage equals or exceeds its HP', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ferrix-uprising'],
                        groundArena: ['battlefield-marine', 'clone-trooper', 'wampa']
                    },
                    player2: {
                        groundArena: ['scout-bike-pursuer'] // 2 HP unit
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.ferrixUprising);
                context.player1.clickCard(context.scoutBikePursuer);

                // Should defeat the unit (6 damage >= 2 HP)
                expect(context.scoutBikePursuer).toBeInZone('discard', context.player2);
            });
        });
    });
});