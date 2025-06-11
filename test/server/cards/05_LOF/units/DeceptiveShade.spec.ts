describe('Deceptive Shade', function () {
    integration(function(contextRef) {
        describe('Deceptive Shade\'s when defeated ability', function() {
            it('gives Ambush to the next unit played by the controller this phase ', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['swoop-racer'],
                        groundArena: ['deceptive-shade'],
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                // Player 2 attacks and defeats Deceptive Shade
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.deceptiveShade);

                expect(context.deceptiveShade).toBeInZone('discard');

                // Player 1 plays Swoop Racer, it gains Ambush
                context.player1.clickCard(context.swoopRacer);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.consularSecurityForce);
            });

            it('gives Ambush to the next unit, even if an event is played in between', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['swoop-racer', 'resupply'],
                        groundArena: ['deceptive-shade'],
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                // Player 2 attacks and defeats Deceptive Shade
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.deceptiveShade);

                expect(context.deceptiveShade).toBeInZone('discard');

                // Player 1 plays Resupply
                context.player1.clickCard(context.resupply);
                context.player2.passAction();

                // Player 1 plays Swoop Racer, it gains Ambush
                context.player1.clickCard(context.swoopRacer);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.consularSecurityForce);
            });

            it('gives ambush to the next unit, even if a piloting upgrade is played in between', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['swoop-racer', 'independent-smuggler', 'hotshot-vwing'],
                        groundArena: ['deceptive-shade'],
                        spaceArena: ['seventh-fleet-defender'],
                    },
                    player2: {
                        hand: ['takedown'],
                        spaceArena: ['hunting-aggressor'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                // Player 2 plays Takedown to defeat Deceptive Shade
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.deceptiveShade);

                expect(context.deceptiveShade).toBeInZone('discard');

                // Player 1 plays Independent Smuggler to pilot the Seventh Fleet Defender
                context.player1.clickCard(context.independentSmuggler);
                context.player1.clickPrompt('Play Independent Smuggler with Piloting');
                context.player1.clickCard(context.seventhFleetDefender);
                expect(context.seventhFleetDefender).toHaveExactUpgradeNames(['independent-smuggler']);
                context.player2.passAction();

                // Player 1 plays Hotshot V-Wing, it gains Ambush
                context.player1.clickCard(context.hotshotVwing);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.huntingAggressor);
            });

            it('does not give Ambush to the next unit played by the opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [],
                        groundArena: [
                            'deceptive-shade',
                            'swoop-racer'
                        ],
                    },
                    player2: {
                        hand: ['battlefield-marine'],
                        groundArena: ['consular-security-force'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                // Player 2 attacks and defeats Deceptive Shade
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.deceptiveShade);

                expect(context.deceptiveShade).toBeInZone('discard');
                context.player1.passAction();

                // Player 2 plays Battlefield Marine, it does not gain Ambush
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.battlefieldMarine.hasSomeKeyword('ambush')).toBeFalse();
            });

            it('the effect expires at the end of the phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['swoop-racer'],
                        groundArena: ['deceptive-shade'],
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                // Player 2 attacks and defeats Deceptive Shade
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.deceptiveShade);

                expect(context.deceptiveShade).toBeInZone('discard');

                // End the phase
                context.player1.claimInitiative();
                context.moveToNextActionPhase();

                // Player 1 plays Swoop Racer, it does not gain Ambush
                context.player1.clickCard(context.swoopRacer);
                expect(context.swoopRacer).toBeInZone('groundArena');
                expect(context.swoopRacer.hasSomeKeyword('ambush')).toBeFalse();
            });

            it('does not give Ambush to deployed leader units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cad-bane#he-who-needs-no-introduction',
                        groundArena: ['deceptive-shade'],
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                // Player 2 attacks and defeats Deceptive Shade
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.deceptiveShade);

                expect(context.deceptiveShade).toBeInZone('discard');

                // Player 1 deploys Cad Bane, it does not gain Ambush
                context.player1.clickCard(context.cadBane);
                context.player1.clickPrompt('Deploy Cad Bane');
                expect(context.cadBane).toBeInZone('groundArena');
                expect(context.cadBane.hasSomeKeyword('ambush')).toBeFalse();
            });

            it('does not give Ambush to friendly units played after the next unit played this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['swoop-racer', 'battlefield-marine'],
                        groundArena: ['deceptive-shade'],
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'dilapidated-ski-speeder'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                // Player 2 attacks and defeats Deceptive Shade
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.deceptiveShade);

                expect(context.deceptiveShade).toBeInZone('discard');

                // Player 1 plays Swoop Racer, it gains Ambush
                context.player1.clickCard(context.swoopRacer);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.consularSecurityForce);
                context.player2.passAction();

                // Player 1 plays Battlefield Marine, it does not gain Ambush
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.battlefieldMarine.hasSomeKeyword('ambush')).toBeFalse();
            });
        });
    });
});