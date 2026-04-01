describe('Chaotic Diversion', function() {
    integration(function(contextRef) {
        const enemyUnitPrompt = 'Ready an enemy unit. If you do, it can\'t attack your base or units you control for this phase.';
        const friendlyUnitPrompt = 'Give a Shield token to a friendly unit';

        it('readies an enemy unit, restricts its attacks, and gives a shield to a friendly unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['chaotic-diversion'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: [{ card: 'wampa', exhausted: true }],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chaoticDiversion);

            // Select the exhausted enemy unit to ready
            expect(context.player1).toHavePrompt(enemyUnitPrompt);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer]);
            context.player1.clickCard(context.wampa);

            // Give a shield to a friendly unit
            expect(context.player1).toHavePrompt(friendlyUnitPrompt);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            // Verify Wampa is readied and Battlefield Marine has a shield
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            expect(context.chaoticDiversion).toBeInZone('discard');

            // Wampa is not selectable for player 2 since there are no legal attack targets
            expect(context.player2).toBeActivePlayer();
            expect(context.player2).not.toBeAbleToSelect(context.wampa);
        });

        it('when targeting a ready enemy unit, it should not apply the attack restriction', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['chaotic-diversion'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: [{ card: 'cartel-spacer', exhausted: true }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chaoticDiversion);

            // Wampa is a valid target even though it's already ready
            expect(context.player1).toHavePrompt(enemyUnitPrompt);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer]);
            context.player1.clickCard(context.wampa);

            // Give a shield to a friendly unit
            expect(context.player1).toHavePrompt(friendlyUnitPrompt);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            // Verify Wampa is still ready and Battlefield Marine has a shield
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            expect(context.chaoticDiversion).toBeInZone('discard');

            // Wampa should still be able to attack since it was not actually readied by the event
            context.player2.clickCard(context.wampa);
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.battlefieldMarine]);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(4);
        });

        it('when the only enemy unit is already ready, that target selection step is skipped', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['chaotic-diversion'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chaoticDiversion);

            // No exhausted enemy units, so skip straight to the shield step
            expect(context.player1).toHavePrompt(friendlyUnitPrompt);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCardNonChecking(context.battlefieldMarine);
            context.player1.clickCard(context.battlefieldMarine);

            // Verify Wampa is still exhausted and Battlefield Marine has a shield
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            expect(context.chaoticDiversion).toBeInZone('discard');

            // Wampa should still be able to attack since it was not readied by the event
            context.player2.clickCard(context.wampa);
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.battlefieldMarine]);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(4);
        });

        it('when there are no friendly units in play, it should still ready the enemy unit and apply the attack restriction', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['chaotic-diversion']
                },
                player2: {
                    groundArena: [{ card: 'wampa', exhausted: true }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chaoticDiversion);

            // Select the exhausted enemy unit to ready
            expect(context.player1).toHavePrompt(enemyUnitPrompt);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);

            // No friendly units to give a shield to — shield step is skipped
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.chaoticDiversion).toBeInZone('discard');

            // Wampa is not selectable for player 2 since there are no legal attack targets
            expect(context.player2).toBeActivePlayer();
            expect(context.player2).not.toBeAbleToSelect(context.wampa);
        });

        it('when there are no enemy units in play, it should still give a shield to a friendly unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['chaotic-diversion'],
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chaoticDiversion);

            // No enemy units — go straight to the shield part
            expect(context.player1).toHavePrompt(friendlyUnitPrompt);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            // Shield was given, it is now player 2's turn
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            expect(context.chaoticDiversion).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });

        it('when there are no units in play at all, it should warn the player that the event has no effect', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['chaotic-diversion']
                },
                player2: {
                    groundArena: []
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chaoticDiversion);
            expect(context.player1).toHavePrompt('Playing Chaotic Diversion will have no effect. Are you sure you want to play it?');
            context.player1.clickPrompt('Play anyway');

            expect(context.chaoticDiversion).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });

        it('the attack restriction does not apply to the enemy unit\'s original controller\'s base and units (P1 takes control after readying)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['chaotic-diversion', 'change-of-heart']
                },
                player2: {
                    groundArena: [{ card: 'wampa', exhausted: true }, 'consular-security-force']
                }
            });

            const { context } = contextRef;

            // Play Chaotic Diversion to ready the Wampa
            context.player1.clickCard(context.chaoticDiversion);

            expect(context.player1).toHavePrompt(enemyUnitPrompt);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.consularSecurityForce]);
            context.player1.clickCard(context.wampa);

            // Player 2 cannot attack with Wampa; they pass
            expect(context.player2).toBeActivePlayer();
            expect(context.player2).not.toBeAbleToSelect(context.wampa);
            context.player2.passAction();

            // Play Change of Heart to take control of the Wampa
            context.player1.clickCard(context.changeOfHeart);
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('groundArena', context.player1);

            // Opponent passes again
            context.player2.passAction();

            // Player 1 can attack with Wampa because the restriction does not apply to P2's base and units
            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.consularSecurityForce]);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(4);
        });
    });
});
