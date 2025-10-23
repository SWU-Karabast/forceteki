describe('Let\'s Talk', function () {
    integration(function (contextRef) {
        it('Let\'s Talk costs 3 less when a friendly unit left play this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'fennec-shand#honoring-the-deal',
                    base: 'data-vault',
                    groundArena: ['battlefield-marine', 'wampa'],
                    hand: ['waylay', 'lets-talk']
                },
                player2: {
                    groundArena: ['rebel-pathfinder']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.waylay);
            context.player1.clickCard(context.battlefieldMarine);

            context.player2.passAction();

            context.player1.clickCard(context.letsTalk);
            context.player1.clickCard(context.wampa);

            context.player1.clickCard(context.rebelPathfinder);

            // reduced cost (6) + waylay (3)
            expect(context.player1.exhaustedResourceCount).toBe(9);
        });

        it('Let\'s Talk selection order matches capture order', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'data-vault',
                    groundArena: ['battlefield-marine', 'wampa'],
                    hand: ['lets-talk']
                },
                player2: {
                    groundArena: ['rebel-pathfinder', 'atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.letsTalk);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickDone();

            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.rebelPathfinder);

            expect(context.atst).toBeCapturedBy(context.wampa);
            expect(context.rebelPathfinder).toBeCapturedBy(context.battlefieldMarine);
        });

        it('Let\'s Talk selection order is changeable and maintains capture order', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'data-vault',
                    groundArena: ['battlefield-marine', 'wampa'],
                    hand: ['lets-talk']
                },
                player2: {
                    groundArena: ['rebel-pathfinder', 'atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.letsTalk);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);

            // Undo selection
            context.player1.clickCard(context.wampa);

            // Redo selection, behind battlefieldMarine
            context.player1.clickCard(context.wampa);

            context.player1.clickDone();

            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.rebelPathfinder]);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.rebelPathfinder);

            expect(context.atst).toBeCapturedBy(context.battlefieldMarine);
            expect(context.rebelPathfinder).toBeCapturedBy(context.wampa);
        });

        it('Let\'s Talk skips captures with no valid targets', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'data-vault',
                    groundArena: ['battlefield-marine', 'wampa', 'tauntaun'],
                    spaceArena: ['awing', 'xwing'],
                    hand: ['lets-talk']
                },
                player2: {
                    leader: { card: 'admiral-ackbar#its-a-trap', deployed: true },
                    groundArena: ['rebel-pathfinder', 'atst'],
                    spaceArena: ['republic-ywing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.letsTalk);

            context.player1.clickCard(context.awing);
            context.player1.clickCard(context.xwing);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.tauntaun);
            context.player1.clickDone();

            expect(context.player1).toBeAbleToSelectExactly(context.republicYwing);
            context.player1.clickCard(context.republicYwing);

            // x-wing selection is skipped due to no valid space units left to target
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.rebelPathfinder]);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.rebelPathfinder);
            // tauntaun selection is skipped due to only remaining unselected unit being leader

            expect(context.atst).toBeCapturedBy(context.wampa);
            expect(context.rebelPathfinder).toBeCapturedBy(context.battlefieldMarine);
        });

        it('Let\'s Talk works with fewer units than opponent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'data-vault',
                    groundArena: ['wampa'],
                    hand: ['lets-talk']
                },
                player2: {
                    leader: { card: 'admiral-ackbar#its-a-trap', deployed: true },
                    groundArena: ['rebel-pathfinder', 'atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.letsTalk);

            context.player1.clickCard(context.wampa);

            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.rebelPathfinder]);
            context.player1.clickCard(context.atst);

            expect(context.atst).toBeCapturedBy(context.wampa);
        });

        it('Let\'s Talk claims bounties simultaneously, allowing for collect order', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'data-vault',
                    groundArena: ['wampa', 'tauntaun'],
                    hand: ['lets-talk']
                },
                player2: {
                    leader: { card: 'admiral-ackbar#its-a-trap', deployed: true },
                    groundArena: ['hylobon-enforcer', 'wanted-insurgents']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.letsTalk);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.tauntaun);
            context.player1.clickDone();

            expect(context.player1).toBeAbleToSelectExactly([context.hylobonEnforcer, context.wantedInsurgents]);
            context.player1.clickCard(context.wantedInsurgents);
            context.player1.clickCard(context.hylobonEnforcer);

            expect(context.wantedInsurgents).toBeCapturedBy(context.wampa);
            expect(context.hylobonEnforcer).toBeCapturedBy(context.tauntaun);

            expect(context.player1).toHaveExactPromptButtons([
                'Collect Bounty: Deal 2 damage to a unit',
                'Collect Bounty: Draw a card'
            ]);

            context.player1.clickPrompt('Collect Bounty: Draw a card');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectAllOf([context.wampa, context.tauntaun, context.admiralAckbar]);
            context.player1.clickCard(context.admiralAckbar);
        });
    });
});