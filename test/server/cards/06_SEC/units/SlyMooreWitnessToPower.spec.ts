describe('Sly Moore, Witness to Power', function() {
    integration(function(contextRef) {
        describe('When Played ability', function() {
            it('while a base is being attacked by an enemy unit this phase, the attacker gets -2/-0', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sly-moore#witness-to-power'],
                        groundArena: ['consular-security-force']
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['green-squadron-awing']
                    }
                });

                const { context } = contextRef;

                // Play Sly Moore, applying the phase-long effect
                context.player1.clickCard(context.slyMoore);

                // Opponent attacks base with Wampa (normally 4 power) => should be reduced by 2
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2);

                // Friendly units should not be affected
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);

                // Enemy units are not debuffed when attacking another unit
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(6);

                context.player1.passAction();

                // attack p1Base with another unit, should have -2
                context.player2.clickCard(context.greenSquadronAwing);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(3);

                // move to next phase, lasting effect should end
                context.moveToNextActionPhase();
                context.setDamage(context.p1Base, 0);

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(4);
            });

            it('should remain in effect if Sly Moore is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sly-moore#witness-to-power']
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play Sly Moore, applying the phase-long effect
                context.player1.clickCard(context.slyMoore);

                // Opponent uses Vanquish to defeat Sly Moore
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.slyMoore);
                context.player1.passAction();

                // Opponent attacks base with Wampa (normally 4 power) => should be reduced by 2
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2);

                // move to next phase, lasting effect should end
                context.moveToNextActionPhase();
                context.setDamage(context.p1Base, 0);

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(4);
            });

            it('should affect units played/deployed after Sly Moore', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sly-moore#witness-to-power'],
                        groundArena: ['consular-security-force']
                    },
                    player2: {
                        leader: 'sabine-wren#galvanized-revolutionary',
                        groundArena: ['wampa'],
                        hand: ['millennium-falcon#piece-of-junk']
                    }
                });

                const { context } = contextRef;

                // Play Sly Moore, applying the phase-long effect
                context.player1.clickCard(context.slyMoore);

                // P2 deploys Sabine
                context.player2.clickCard(context.sabineWren);
                context.player2.clickPrompt('Deploy Sabine Wren');
                context.player1.passAction();

                // Attack base with Sabine, power reduced to 0, but ability still deals 1 damage to base
                context.player2.clickCard(context.sabineWren);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(1);
                context.player1.passAction();

                // P2 plays Millennium Falcon, which enters play ready
                context.player2.clickCard(context.millenniumFalcon);
                context.player1.passAction();

                // Attack base with Millennium Falcon, power reduced to 1
                context.player2.clickCard(context.millenniumFalcon);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2);
            });

            it('affects units that change to enemy control after Sly Moore is played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sly-moore#witness-to-power'],
                        groundArena: ['consular-security-force']
                    },
                    player2: {
                        hand: ['change-of-heart']
                    }
                });

                const { context } = contextRef;

                // Play Sly Moore, applying the phase-long effect
                context.player1.clickCard(context.slyMoore);

                // P2 plays Change of Heart to take control of Consular Security Force
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.consularSecurityForce);
                context.player1.passAction();

                // Attack base with Consular Security Force, power reduced to 1
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(1);
            });
        });

        describe('Plot ability', function() {
            it('can be played from the resource row when a leader is deployed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'jabba-the-hutt#wonderful-human-being',
                        resources: ['sly-moore#witness-to-power', 'atst', 'atst', 'atst', 'atst']
                    }
                });

                const { context } = contextRef;

                // Deploy Jabba
                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickPrompt('Deploy Jabba the Hutt');

                // Sly Moore's Plot ability should trigger
                expect(context.player1).toHavePassAbilityPrompt('Play Sly Moore using Plot');
                context.player1.clickPrompt('Trigger');

                expect(context.slyMoore).toBeInZone('groundArena', context.player1);
                expect(context.jabbaTheHutt).toBeInZone('groundArena', context.player1);
            });
        });
    });
});
