describe('Numa, Still Fighting', function() {
    integration(function(contextRef) {
        it('should prevent 1 non-combat damage with damage being one', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['numa#still-fighting'],
                },
                player2: {
                    hand: ['daring-raid', 'elite-p38-starfighter'],
                    groundArena: ['regional-governor', 'noti-mobile-pod'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.eliteP38Starfighter);
            context.player2.clickCard(context.numa);

            expect(context.numa.damage).toBe(0);
        });

        it('should prevent 1 non-combat damage with damage being more than 1', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['numa#still-fighting'],
                },
                player2: {
                    hand: ['daring-raid', 'elite-p38-starfighter'],
                    groundArena: ['regional-governor', 'noti-mobile-pod'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.daringRaid);
            context.player2.clickCard(context.numa);

            expect(context.numa.damage).toBe(1);
        });

        it('should prevent 1 combat damage while defending with damage being 1', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['numa#still-fighting'],
                },
                player2: {
                    hand: ['daring-raid', 'elite-p38-starfighter'],
                    groundArena: ['regional-governor', 'noti-mobile-pod'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.regionalGovernor);
            context.player2.clickCard(context.numa);

            expect(context.numa.damage).toBe(0);
        });

        it('should prevent 1 combat damage while defending with damage being more than 1', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['numa#still-fighting'],
                },
                player2: {
                    hand: ['daring-raid', 'elite-p38-starfighter'],
                    groundArena: ['regional-governor', 'noti-mobile-pod'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.notiMobilePod);
            context.player2.clickCard(context.numa);

            expect(context.numa.damage).toBe(2);
        });

        it('should prevent damage in more than one instance in one phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['numa#still-fighting'],
                },
                player2: {
                    hand: ['daring-raid', 'elite-p38-starfighter'],
                    groundArena: ['regional-governor', 'noti-mobile-pod'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.regionalGovernor);
            context.player2.clickCard(context.numa);

            expect(context.numa.damage).toBe(0);

            context.player1.passAction();

            context.player2.clickCard(context.notiMobilePod);
            context.player2.clickCard(context.numa);

            expect(context.numa.damage).toBe(2);
        });

        it('should prevent 1 combat damage while attacking with damage being more than 1', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['numa#still-fighting'],
                },
                player2: {
                    hand: ['daring-raid', 'elite-p38-starfighter'],
                    groundArena: ['regional-governor', 'noti-mobile-pod'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.numa);
            context.player1.clickCard(context.notiMobilePod);

            expect(context.numa.damage).toBe(2);
        });

        it('should not prevent indirect damage', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['numa#still-fighting'],
                },
                player2: {
                    hand: ['torpedo-barrage', 'elite-p38-starfighter'],
                    groundArena: ['regional-governor', 'noti-mobile-pod'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.torpedoBarrage);
            context.player2.clickPrompt('Deal indirect damage to opponent');
            context.player1.setDistributeIndirectDamagePromptState(new Map([
                [context.p1Base, 3],
                [context.numa, 2],
            ]));

            expect(context.numa.damage).toBe(2);
        });
    });
});