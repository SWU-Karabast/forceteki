describe('Crosshair, I\'ve Changed', function() {
    integration(function(contextRef) {
        it('when dealt ability damage and survives, each player draws and opponent\'s base takes 2 damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['open-fire'],
                    groundArena: ['crosshair#ive-changed'],
                    deck: ['battlefield-marine', 'wampa'],
                },
                player2: {
                    deck: ['porg'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.openFire);
            context.player1.clickCard(context.crosshair);

            expect(context.player2).toBeActivePlayer();
            expect(context.crosshair.damage).toBe(4);
            expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
            expect(context.wampa).toBeInZone('deck', context.player1);
            expect(context.porg).toBeInZone('hand', context.player2);
            expect(context.p2Base.damage).toBe(2);
        });

        it('when dealt combat damage and survives, each player draws and opponent\'s base takes 2 damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['crosshair#ive-changed'],
                    deck: ['battlefield-marine'],
                },
                player2: {
                    deck: ['porg'],
                    groundArena: ['wampa'],
                    hasInitiative: true
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.crosshair);

            expect(context.player1).toBeActivePlayer();
            expect(context.crosshair.damage).toBe(4);
            expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
            expect(context.porg).toBeInZone('hand', context.player2);
            expect(context.p2Base.damage).toBe(2);
        });

        it('should deal 2 damage to opponent\'s base when he is drawing cards on action phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['crosshair#ive-changed'],
                    deck: ['battlefield-marine'],
                },
                player2: {
                    hand: ['mission-briefing'],
                    hasInitiative: true
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.missionBriefing);
            context.player2.clickPrompt('You');

            expect(context.player1).toBeActivePlayer();
            expect(context.crosshair.damage).toBe(0);
            expect(context.p2Base.damage).toBe(2);
        });

        it('when dealt combat damage and not survives, nobody draw and nothing happens', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['crosshair#ive-changed'],
                    deck: ['battlefield-marine'],
                },
                player2: {
                    deck: ['porg'],
                    groundArena: ['atst'],
                    hasInitiative: true
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.crosshair);

            expect(context.player1).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('deck', context.player1);
            expect(context.porg).toBeInZone('deck', context.player2);
            expect(context.p2Base.damage).toBe(0);
        });

        it('should not deal damage to opponent base when opponent draws cards during regroup phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['crosshair#ive-changed'],
                },
            });

            const { context } = contextRef;

            const handSize = context.player2.handSize;

            context.moveToRegroupPhase();
            context.player1.clickDone();
            context.player2.clickDone();

            expect(context.p2Base.damage).toBe(0);
            expect(context.player2.handSize).toBe(handSize + 2);
        });
    });
});
