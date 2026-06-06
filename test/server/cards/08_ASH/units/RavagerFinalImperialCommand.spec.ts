describe('Ravager, Final Imperial Command', function () {
    integration(function (contextRef) {
        describe('When you play a unit ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['ravager#final-imperial-command', 'cartel-spacer'],
                        groundArena: ['wampa'],
                        hand: ['tieln-fighter', 'battlefield-marine', 'entrenched', 'drop-in', 'cantina-braggart', 'blue-leader#scarif-air-support'],
                        leader: { card: 'rey#more-than-a-scavenger', deployed: false },
                    },
                    player2: {
                        spaceArena: ['quasar-tie-carrier'],
                        groundArena: ['reinforcement-walker']
                    }
                });
            });

            it('should deal damage equal to the played unit\'s power to a targeted enemy unit in the space arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.tielnFighter);

                // Only space units selectable
                expect(context.player1).toBeAbleToSelectExactly([
                    context.ravager,
                    context.cartelSpacer,
                    context.tielnFighter,
                    context.quasarTieCarrier
                ]);

                // Deal 2 damage to enemy
                expect(context.player1).toHavePrompt('Deal 2 damage to a unit in the space arena');
                context.player1.clickCard(context.quasarTieCarrier);

                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays TIE/ln Fighter',
                    'player1 uses Ravager to deal 2 damage to Quasar TIE Carrier'
                ]);
                expect(context.quasarTieCarrier.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal damage equal to the played unit\'s power to a targeted friendly unit in the space arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.tielnFighter);

                // Deal 2 damage to friendly
                expect(context.player1).toHavePrompt('Deal 2 damage to a unit in the space arena');
                context.player1.clickCard(context.cartelSpacer);

                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays TIE/ln Fighter',
                    'player1 uses Ravager to deal 2 damage to Cartel Spacer'
                ]);
                expect(context.cartelSpacer.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal damage equal to the played unit\'s power to a targeted enemy unit in the ground arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);

                // Only ground units selectable
                expect(context.player1).toBeAbleToSelectExactly([
                    context.wampa,
                    context.reinforcementWalker,
                    context.battlefieldMarine
                ]);

                // Deal 3 damage to enemy
                expect(context.player1).toHavePrompt('Deal 3 damage to a unit in the ground arena');
                context.player1.clickCard(context.reinforcementWalker);

                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays Battlefield Marine',
                    'player1 uses Ravager to deal 3 damage to Reinforcement Walker'
                ]);
                expect(context.reinforcementWalker.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal damage equal to the played unit\'s power to a targeted friendly unit in the ground arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);

                // Deal 3 damage to friendly
                expect(context.player1).toHavePrompt('Deal 3 damage to a unit in the ground arena');
                context.player1.clickCard(context.wampa);

                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays Battlefield Marine',
                    'player1 uses Ravager to deal 3 damage to Wampa'
                ]);
                expect(context.wampa.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to pass and deal no damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.tielnFighter);

                // Decline the optional ability
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                // No units take damage
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.tielnFighter.damage).toBe(0);
                expect(context.quasarTieCarrier.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.reinforcementWalker.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when a leader is deployed', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.reyMoreThanAScavenger);
                context.player1.clickPrompt('Deploy Rey');

                // No trigger, move to next player
                expect(context.reyMoreThanAScavenger.deployed).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when an upgrade is played', function () {
                const { context } = contextRef;

                // Play an upgrade onto a friendly unit
                context.player1.clickCard(context.entrenched);
                context.player1.clickCard(context.cartelSpacer);

                // No trigger, move to next player.
                expect(context.cartelSpacer).toHaveExactUpgradeNames(['entrenched']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when a token unit is created', function () {
                const { context } = contextRef;

                // Create Clone Troopers
                context.player1.clickCard(context.dropIn);

                // Does not triggger
                const cloneTroopers = context.player1.findCardsByName('clone-trooper');
                expect(cloneTroopers.length).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not tigger when a 0 power unit is played', function () {
                const { context } = contextRef;

                // Play a 0 power unit
                context.player1.clickCard(context.cantinaBraggart);

                // Does not trigger
                expect(context.cantinaBraggart).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow Blue Leader to deal damage while it is in space', function () {
                const { context } = contextRef;

                // Play Blue Leader
                context.player1.clickCard(context.blueLeaderScarifAirSupport);
                context.player1.clickPrompt('Deal damage equal to its power to a unit in the same arena');

                // Only space units selectable
                expect(context.player1).toBeAbleToSelectExactly([
                    context.ravager,
                    context.cartelSpacer,
                    context.blueLeader,
                    context.quasarTieCarrier
                ]);

                // Deal 3 damage
                expect(context.player1).toHavePrompt('Deal 3 damage to a unit in the space arena');
                context.player1.clickCard(context.ravager);

                expect(context.getChatLogs()).toEqual([
                    'player1 uses Ravager to deal 3 damage to Ravager',
                ]);

                expect(context.blueLeader).toBeInZone('spaceArena');

                // Pass the ambush and moving to ground
                context.player1.clickPrompt('Ambush');
                context.player1.clickPrompt('Pass');
                context.player1.clickPrompt('Trigger');

                expect(context.blueLeader).toBeInZone('groundArena');
                expect(context.ravager.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow Blue Leader to deal damage while it is on the ground', function () {
                const { context } = contextRef;

                // Play Blue Leader to the ground
                context.player1.clickCard(context.blueLeaderScarifAirSupport);
                context.player1.clickPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');
                context.player1.clickPrompt('Trigger');

                expect(context.blueLeader).toBeInZone('groundArena');

                context.player1.clickPrompt('Deal damage equal to its power to a unit in the same arena');

                // Only ground units selectable
                expect(context.player1).toBeAbleToSelectExactly([
                    context.wampa,
                    context.reinforcementWalker,
                    context.blueLeader
                ]);

                // Deal 5 damage
                expect(context.player1).toHavePrompt('Deal 5 damage to a unit in the ground arena');
                context.player1.clickCard(context.reinforcementWalker);

                // Pass the ambush
                context.player1.clickPrompt('Pass');

                expect(context.getChatLogs()).toEqual([
                    'player1 uses Ravager to deal 5 damage to Reinforcement Walker'
                ]);

                expect(context.reinforcementWalker.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});