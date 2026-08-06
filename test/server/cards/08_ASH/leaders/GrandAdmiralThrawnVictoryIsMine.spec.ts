describe('Grand Admiral Thrawn, Victory Is Mine', function() {
    integration(function(contextRef) {
        describe('Leader side action ability', function() {
            it('should exhaust to attack with a unit and give it restore 2', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#victory-is-mine',
                        groundArena: ['battlefield-marine'],
                        base: { card: 'chopper-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickPrompt('Attack with a unit. It gains Restore 2 for this attack if you control 1 unit.');

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.grandAdmiralThrawn.exhausted).toBeTrue();
                expect(context.p1Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.hasSomeKeyword('restore')).toBeFalse();
            });

            it('should exhaust to attack with a unit and but not give it restore 2 as there are more friendly units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#victory-is-mine',
                        groundArena: ['battlefield-marine'],
                        base: { card: 'chopper-base', damage: 5 }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickPrompt('Attack with a unit.');

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.grandAdmiralThrawn.exhausted).toBeTrue();
                expect(context.p1Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.hasSomeKeyword('restore')).toBeFalse();
            });

            it('should exhaust to attack with a unit but not give it restore 2 as there are more enemy', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#victory-is-mine',
                        groundArena: ['battlefield-marine'],
                        base: { card: 'chopper-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickPrompt('Attack with a unit. It gains Restore 2 for this attack if you control 2 units.');

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.grandAdmiralThrawn.exhausted).toBeTrue();
                expect(context.p1Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.hasSomeKeyword('restore')).toBeFalse();
            });

            it('should not trigger if there are no valid targets', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-thrawn#victory-is-mine',
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);

                expect(context.player1).toHavePrompt('Play Grand Admiral Thrawn:');
                context.player1.clickPrompt('(No effect) Attack with a unit. It gains Restore 2 for this attack if you control 1 unit.');

                expect(context.player1).toHavePrompt('The ability "Attack with a unit. It gains Restore 2 for this attack if you control 1 unit." will have no effect. Are you sure you want to use it?');
                context.player1.clickPrompt('Cancel');

                expect(context.grandAdmiralThrawn.exhausted).toBeFalse();
            });
        });

        describe('Leader unit side on attack ability', function() {
            it('should allow defeating a non-leader unit if Player1 has more units than Player2', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-admiral-thrawn#victory-is-mine', deployed: true },
                        groundArena: ['battlefield-marine', 'atst'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        leader: { card: 'ahsoka-tano#trust-in-the-force', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('You have multiple triggers to resolve. Choose which to resolve first:');
                context.player1.clickPrompt('Defeat a non-leader unit the defending player controls');

                expect(context.player1).toHavePrompt('Defeat a non-leader unit the defending player controls');
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce).toBeInZone('discard', context.player2);

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to be passed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-admiral-thrawn#victory-is-mine', deployed: true },
                        groundArena: ['battlefield-marine', 'atst'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        leader: { card: 'ahsoka-tano#trust-in-the-force', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('You have multiple triggers to resolve. Choose which to resolve first:');
                context.player1.clickPrompt('Defeat a non-leader unit the defending player controls');

                expect(context.player1).toHavePrompt('Defeat a non-leader unit the defending player controls');
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass');
                expect(context.consularSecurityForce).toBeInZone('groundArena', context.player2);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if Player1 has less units than Player2', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-admiral-thrawn#victory-is-mine', deployed: true },
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'wampa'],
                        spaceArena: ['awing'],
                        leader: { card: 'ahsoka-tano#trust-in-the-force', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).not.toHavePrompt('Defeat a non-leader unit the defending player controls');

                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if Player1 has as many units as Player2', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-admiral-thrawn#victory-is-mine', deployed: true },
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing'],
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'wampa'],
                        leader: { card: 'ahsoka-tano#trust-in-the-force', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).not.toHavePrompt('Defeat a non-leader unit the defending player controls');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});