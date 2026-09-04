describe('Kelnacca, Solitary Master', function () {
    integration(function (contextRef) {
        it('should deal no damage and pass priority when 0 resources are paid', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'the-armorer#steel-shapes-us',
                    hand: ['kelnacca#solitary-master'],
                    resources: 8
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kelnacca);
            expect(context.player1).toHaveNumericPromptRange(0, 4);
            context.player1.chooseListOption('0');

            expect(context.player1.exhaustedResourceCount).toBe(4);
            expect(context.wampa.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('should still pay resources but deal no damage when fewer than 3 are paid', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'the-armorer#steel-shapes-us',
                    hand: ['kelnacca#solitary-master'],
                    resources: 8
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kelnacca);
            expect(context.player1).toHaveNumericPromptRange(0, 4);
            context.player1.chooseListOption('2');

            expect(context.player1.exhaustedResourceCount).toBe(6);
            expect(context.wampa.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('should deal damage equal to its power to a chosen enemy unit when paying exactly 3 resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'the-armorer#steel-shapes-us',
                    hand: ['kelnacca#solitary-master'],
                    resources: 8
                },
                player2: {
                    groundArena: ['wampa', 'battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kelnacca);
            expect(context.player1).toHaveNumericPromptRange(0, 4);
            context.player1.chooseListOption('3');

            expect(context.player1).toHavePrompt('Deal 4 damage to an enemy unit');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
            context.player1.clickCard(context.wampa);

            expect(context.wampa.damage).toBe(4);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.player1.exhaustedResourceCount).toBe(7);
            expect(context.player2).toBeActivePlayer();
        });

        it('should deal only one damage instance (rounding down, not up) when paying 4 or 5 resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'the-armorer#steel-shapes-us',
                    hand: ['kelnacca#solitary-master'],
                    resources: 11
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kelnacca);
            expect(context.player1).toHaveNumericPromptRange(0, 7);
            context.player1.chooseListOption('5');

            expect(context.player1).toHavePrompt('Deal 4 damage to an enemy unit');
            context.player1.clickCard(context.wampa);

            // floor(5 / 3) === 1, so exactly one 4-damage instance is dealt, never 4.5 or 8
            expect(context.wampa.damage).toBe(4);
            expect(context.player1.exhaustedResourceCount).toBe(9);
            expect(context.player2).toBeActivePlayer();
        });

        it('should deal two separate damage instances when paying 6 resources, letting a different unit be chosen each time', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'the-armorer#steel-shapes-us',
                    hand: ['kelnacca#solitary-master'],
                    resources: 11
                },
                player2: {
                    groundArena: ['wampa', 'battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kelnacca);
            expect(context.player1).toHaveNumericPromptRange(0, 7);
            context.player1.chooseListOption('6');

            expect(context.player1).toHavePrompt('Deal 4 damage to an enemy unit');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
            // uses the non-checking click variant since this prompt looks identical (same title, same two
            // selectable units) both before and after — the underlying game state (damage dealt) still changes,
            // it's just not reflected in the prompt shape the "expect change" heuristic compares
            context.player1.clickCardNonChecking(context.wampa);

            // second damage instance is a fresh target selection, not part of a single lump-sum hit
            expect(context.player1).toHavePrompt('Deal 4 damage to an enemy unit');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
            context.player1.clickCardNonChecking(context.battlefieldMarine);

            expect(context.wampa.damage).toBe(4);
            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.player1.exhaustedResourceCount).toBe(10);
            expect(context.player2).toBeActivePlayer();
        });

        it('should allow choosing the same unit for each damage instance, with a single Shield preventing all instances since they are dealt simultaneously', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'the-armorer#steel-shapes-us',
                    hand: ['kelnacca#solitary-master'],
                    resources: 11
                },
                player2: {
                    groundArena: [{ card: 'atte-vanguard', upgrades: ['shield'] }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kelnacca);
            expect(context.player1).toHaveNumericPromptRange(0, 7);
            context.player1.chooseListOption('6');

            // both damage instances are dealt simultaneously, so a single Shield token prevents all of it,
            // just as a single lump-sum hit would be
            context.player1.clickCardNonChecking(context.atteVanguard);
            context.player1.clickCardNonChecking(context.atteVanguard);

            expect(context.atteVanguard).toHaveExactUpgradeNames([]);
            expect(context.atteVanguard.damage).toBe(0);
            expect(context.player1.exhaustedResourceCount).toBe(10);
            expect(context.player2).toBeActivePlayer();
        });

        it('should only remove the Shield and deal no damage at all, even across more than two simultaneous instances', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'the-armorer#steel-shapes-us',
                    hand: ['kelnacca#solitary-master'],
                    resources: 14
                },
                player2: {
                    // 3 HP is less than a single 4-damage instance, so if even one instance leaked through
                    // the unit would be defeated
                    groundArena: [{ card: 'cantina-braggart', upgrades: ['shield'] }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kelnacca);
            expect(context.player1).toHaveNumericPromptRange(0, 10);
            context.player1.chooseListOption('9');

            // 3 damage instances (floor(9 / 3)), all targeting the same shielded unit
            context.player1.clickCardNonChecking(context.cantinaBraggart);
            context.player1.clickCardNonChecking(context.cantinaBraggart);
            context.player1.clickCardNonChecking(context.cantinaBraggart);

            // only the Shield is removed; no damage gets through to the unit itself, and it survives
            expect(context.cantinaBraggart).toBeInZone('groundArena', context.player2);
            expect(context.cantinaBraggart).toHaveExactUpgradeNames([]);
            expect(context.cantinaBraggart.damage).toBe(0);
            expect(context.player1.exhaustedResourceCount).toBe(13);
            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to deal damage to a deployed enemy leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'the-armorer#steel-shapes-us',
                    hand: ['kelnacca#solitary-master'],
                    resources: 8
                },
                player2: {
                    groundArena: ['wampa'],
                    leader: { card: 'cad-bane#still-faster-than-you', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kelnacca);
            context.player1.chooseListOption('3');

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cadBane]);
            context.player1.clickCard(context.cadBane);

            expect(context.cadBane.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });

        it('should still pay resources but skip the damage step when the opponent has no arena units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'the-armorer#steel-shapes-us',
                    hand: ['kelnacca#solitary-master'],
                    resources: 8
                },
                player2: {}
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kelnacca);
            expect(context.player1).toHaveNumericPromptRange(0, 4);
            context.player1.chooseListOption('3');

            expect(context.player1.exhaustedResourceCount).toBe(7);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
