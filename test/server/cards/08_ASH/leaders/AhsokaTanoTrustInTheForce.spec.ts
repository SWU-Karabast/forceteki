describe('Ahsoka Tano, Trust In The Force', function() {
    integration(function(contextRef) {
        describe('Leader side action ability', function() {
            it('should exhaust to give a unit with less power than a friendly unit +2/+0 for this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'ahsoka-tano#trust-in-the-force',
                        groundArena: ['battlefield-marine', 'wampa'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine has 3 power, Wampa has 4 power
                // Max friendly power is 4, so units with less than 4 power can be targeted
                context.player1.clickCard(context.ahsokaTano);
                context.player1.clickPrompt('Choose a unit with less power than a friendly unit. It gets +2/+0 for this phase');

                // Can target any unit with power < 4 (Battlefield Marine has 3, Consular Security Force has 3)
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.consularSecurityForce]);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.consularSecurityForce.getPower()).toBe(5);
                expect(context.ahsokaTano.exhausted).toBeTrue();

                expect(context.consularSecurityForce.getPower()).toBe(5);
                expect(context.consularSecurityForce.getHp()).toBe(7);

                context.moveToNextActionPhase();

                expect(context.consularSecurityForce.getPower()).toBe(3);
                expect(context.consularSecurityForce.getHp()).toBe(7);
            });

            it('should not trigger if there are no valid targets', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'ahsoka-tano#trust-in-the-force',
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Wampa has 4 power, AT-ST has 6 power
                // No unit with power < 4, so ability has no valid targets
                context.player1.clickCard(context.ahsokaTano);

                // When clicking undeployed leader with no valid targets, shows confirmation prompt
                expect(context.player1).toHavePrompt('Play Ahsoka Tano:');
                context.player1.clickPrompt('(No effect) Choose a unit with less power than a friendly unit. It gets +2/+0 for this phase');

                // Confirm using the ability even though it has no effect
                expect(context.player1).toHavePrompt('The ability "Choose a unit with less power than a friendly unit. It gets +2/+0 for this phase" will have no effect. Are you sure you want to use it?');
                context.player1.clickPrompt('Cancel');

                expect(context.ahsokaTano.exhausted).toBeFalse();
            });
        });

        describe('Leader unit side on attack ability', function() {
            it('should give a unit with less power than Ahsoka Tano +2/+0 for this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'ahsoka-tano#trust-in-the-force', deployed: true },
                        groundArena: ['battlefield-marine', 'atst'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ahsokaTano);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Give a unit with less than 5 power +2/+0 for this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.consularSecurityForce]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.getPower()).toBe(5);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                context.moveToNextActionPhase();

                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });

            it('should give a unit with less power than Ahsoka Tano +2/+0 for this phase (with upgrades)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'ahsoka-tano#trust-in-the-force', deployed: true, upgrades: ['mastery'] },
                        groundArena: ['battlefield-marine', 'atst'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ahsokaTano);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Give a unit with less than 8 power +2/+0 for this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.atst, context.consularSecurityForce]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.getPower()).toBe(8);
                expect(context.atst.getHp()).toBe(7);

                context.moveToNextActionPhase();

                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);
            });

            it('should allow passing the ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'ahsoka-tano#trust-in-the-force', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ahsokaTano);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Give a unit with less than 5 power +2/+0 for this phase');
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });
        });

        it('Leader unit side support ability', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'ahsoka-tano#trust-in-the-force',
                    groundArena: ['battlefield-marine', 'atst'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['consular-security-force']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ahsokaTano);
            context.player1.clickPrompt('Deploy Ahsoka Tano');

            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt('Give a unit with less than 6 power +2/+0 for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.consularSecurityForce, context.ahsokaTano]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.getPower()).toBe(5);
            expect(context.battlefieldMarine.getHp()).toBe(3);

            context.moveToNextActionPhase();

            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
        });
    });
});
