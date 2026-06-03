describe('Justifier, Relentless', function() {
    integration(function(contextRef) {
        it('Justifier\'s when played ability should optionally deal 1 damage to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['justifier#relentless'],
                    spaceArena: ['system-patrol-craft']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.justifier);

            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.justifier, context.wampa, context.greenSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(1);
        });

        it('Justifier\'s when played ability should optionally deal 1 damage to itself', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['justifier#relentless'],
                    spaceArena: ['system-patrol-craft']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.justifier);

            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.justifier, context.wampa, context.greenSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.justifier);
            expect(context.justifier.damage).toBe(1);
        });

        it('Justifier\'s when played ability should optionally deal 1 damage to a leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['justifier#relentless'],
                    spaceArena: ['system-patrol-craft'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.justifier);

            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.justifier, context.wampa, context.greenSquadronAwing, context.grandInquisitor]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.grandInquisitor);
            expect(context.grandInquisitor.damage).toBe(1);
        });

        it('Justifier\'s when played ability should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['justifier#relentless'],
                    spaceArena: ['system-patrol-craft']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.justifier);

            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.justifier, context.wampa, context.greenSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');
            expect(context.wampa.damage).toBe(0);
            expect(context.justifier.damage).toBe(0);
            expect(context.systemPatrolCraft.damage).toBe(0);
            expect(context.greenSquadronAwing.damage).toBe(0);
        });

        it('Justifier\'s on attack should optionally deal 1 damage to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['system-patrol-craft', 'justifier#relentless']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.justifier);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.justifier, context.wampa, context.greenSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(1);
        });

        it('Justifier\'s on attack should optionally deal 1 damage to itself', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['system-patrol-craft', 'justifier#relentless']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.justifier);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.justifier, context.wampa, context.greenSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.justifier);
            expect(context.justifier.damage).toBe(1);
        });

        it('Justifier\'s on attack should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['system-patrol-craft', 'justifier#relentless']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.justifier);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.justifier, context.wampa, context.greenSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');
            expect(context.wampa.damage).toBe(0);
            expect(context.justifier.damage).toBe(0);
            expect(context.systemPatrolCraft.damage).toBe(0);
            expect(context.greenSquadronAwing.damage).toBe(0);
        });

        it('Justifier\'s on attack should optionally deal 1 damage to a leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['system-patrol-craft', 'justifier#relentless'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.justifier);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.justifier, context.wampa, context.greenSquadronAwing, context.grandInquisitor]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.grandInquisitor);
            expect(context.grandInquisitor.damage).toBe(1);
        });

        it('Justifier\'s On Attack should give Advantage if the unit dies', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'system-patrol-craft', damage: 1 }, { card: 'justifier#relentless', damage: 1 }]
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['wing-leader']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.justifier);
            context.player1.clickCard(context.p2Base);

            context.player1.clickCard(context.wingLeader);
            expect(context.wingLeader).toBeInZone('discard', context.player2);

            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.justifier, context.wampa]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toHaveExactUpgradeNames(['advantage']);
        });

        it('Justifier\'s On Attack should give Advantage if the unit dies, and have that Advantage work for the attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'system-patrol-craft', damage: 1 }, { card: 'justifier#relentless', damage: 1 }]
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['wing-leader']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.justifier);
            context.player1.clickCard(context.p2Base);

            context.player1.clickCard(context.wingLeader);
            expect(context.wingLeader).toBeInZone('discard', context.player2);

            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.justifier, context.wampa]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.justifier);
            expect(context.p2Base.damage).toBe(5);
            expect(context.justifier).toHaveExactUpgradeNames([]);
        });

        it('Justifier\'s When Played should give Advantage if the unit dies', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['justifier#relentless'],
                    spaceArena: [{ card: 'system-patrol-craft', damage: 1 }]
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['wing-leader']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.justifier);

            context.player1.clickCard(context.wingLeader);
            expect(context.wingLeader).toBeInZone('discard', context.player2);

            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.justifier, context.wampa]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toHaveExactUpgradeNames(['advantage']);
        });
    });
});