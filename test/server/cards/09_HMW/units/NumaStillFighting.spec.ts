describe('Numa, Still Fighting', function() {
    integration(function(contextRef) {
        describe('Han Solo\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['numa#still-fighting', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['daring-raid', 'elite-p38-starfighter', 'torpedo-barrage'],
                        groundArena: ['regional-governor', 'noti-mobile-pod'],
                        hasInitiative: true
                    }
                });
            });

            it('should prevent 1 non-combat damage with damage being one', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.eliteP38Starfighter);
                context.player2.clickCard(context.numa);

                expect(context.numa.damage).toBe(0);
            });

            it('should prevent 1 non-combat damage with damage being more than 1', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.numa);

                expect(context.numa.damage).toBe(1);
            });

            it('should prevent 1 combat damage while defending with damage being 1', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.regionalGovernor);
                context.player2.clickCard(context.numa);

                expect(context.numa.damage).toBe(0);
            });

            it('should prevent 1 combat damage while defending with damage being more than 1', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.notiMobilePod);
                context.player2.clickCard(context.numa);

                expect(context.numa.damage).toBe(2);
            });

            it('should prevent damage in more than one instance in one phase', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.regionalGovernor);
                context.player2.clickCard(context.numa);

                expect(context.numa.damage).toBe(0);

                context.player1.passAction();

                context.player2.clickCard(context.notiMobilePod);
                context.player2.clickCard(context.numa);

                expect(context.numa.damage).toBe(2);
            });

            it('should prevent 1 combat damage while attacking with damage being more than 1', function() {
                const { context } = contextRef;

                context.player2.passAction();

                context.player1.clickCard(context.numa);
                context.player1.clickCard(context.notiMobilePod);

                expect(context.numa.damage).toBe(2);
                expect(context.notiMobilePod).toBeInZone('discard', context.player2);
            });

            it('should not prevent indirect damage', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.torpedoBarrage);
                context.player2.clickPrompt('Deal indirect damage to opponent');
                context.player1.setDistributeIndirectDamagePromptState(new Map([
                    [context.p1Base, 3],
                    [context.numa, 2],
                ]));

                expect(context.numa.damage).toBe(2);
            });

            it('should not prevent any damage for enemy units and friendly units', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.regionalGovernor);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.regionalGovernor.damage).toBe(3);
            });
        });

        describe('interaction with Asajj Ventress, I Work Alone', function() {
            it('should prevent the first ping but the second ping still resolves', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#i-work-alone',
                        groundArena: ['numa#still-fighting'],
                        resources: 4
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toBeAbleToSelectExactly([context.numa]);
                context.player1.clickCard(context.numa);

                // Numa prevents the 1 damage, but the "if you do" condition is still met (SWU CR 8.9.2)
                expect(context.numa.damage).toBe(0);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);

                expect(context.asajjVentress.exhausted).toBe(true);
            });
        });

        describe('interaction with Sith Holocron', function() {
            it('should prevent 1 of the damage and the "if you do" still resolves', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'karis#we-dont-like-strangers', upgrades: ['sith-holocron'] },
                            'numa#still-fighting'
                        ],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.karis);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.karis, context.numa]);
                context.player1.clickCard(context.numa);

                // Numa prevents 1 of the 2 damage, and the "if you do" condition is still met
                expect(context.numa.damage).toBe(1);
                expect(context.p2Base.damage).toBe(5); // 2 (Karis) + 1 (Sith Holocron) + 2 (Sith Holocron ability)
                expect(context.player2).toBeActivePlayer();
            });
        });
    });

    integration(function(contextRef) {
        it('should prevent 1 of the excess damage dealt by Blizzard Assault AT-AT', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['blizzard-assault-atat']
                },
                player2: {
                    groundArena: ['wampa', 'numa#still-fighting']
                }
            });

            const { context } = contextRef;

            // Blizzard Assault AT-AT deals 9 damage to Wampa, 4 of it is excess damage
            context.player1.clickCard(context.blizzardAssaultAtat);
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('discard');

            context.player1.clickCard(context.numa);

            expect(context.numa.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('should still credit the reduced excess damage to Blizzard Assault AT-AT\'s controller', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['blizzard-assault-atat']
                },
                player2: {
                    groundArena: ['wampa', { card: 'numa#still-fighting', damage: 1 }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.blizzardAssaultAtat);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.numa);

            // 4 excess damage, 1 prevented, defeats Numa with 1 damage already on her
            expect(context.numa).toBeInZone('discard');
            expect(context.getChatLogs(1)[0]).toContain('Numa is defeated by player1');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
