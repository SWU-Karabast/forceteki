describe('Reprocess\' ability', function () {
    integration(function (contextRef) {
        it('should return up to 4 units from your discard pile to the bottom of your deck in a random order and create that many Battle Droid tokens.', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['reprocess'],
                    groundArena: ['pyke-sentinel'],
                    spaceArena: ['cartel-spacer'],
                    discard: [
                        'battlefield-marine',
                        'echo-base-defender',
                        'specforce-soldier',
                        'regional-sympathizers',
                        'resupply',
                        'restock',
                        'atst',
                        'wampa',
                    ]
                },
                player2: {
                    discard: [
                        'consular-security-force', // We can't select in opponent's discard pile
                    ]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.reprocess);
            expect(context.player1).toBeAbleToSelectExactly([
                context.battlefieldMarine,
                context.echoBaseDefender,
                context.specforceSoldier,
                context.regionalSympathizers,
                context.atst,
                context.wampa,
            ]);
            expect(context.player1).toHaveChooseNoTargetButton();
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.echoBaseDefender);
            context.player1.clickCard(context.specforceSoldier);
            context.player1.clickCard(context.regionalSympathizers);
            context.player1.clickCardNonChecking(context.atst);
            context.player1.clickCardNonChecking(context.wampa);
            context.player1.clickPrompt('Done');

            expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 4);
            expect(context.echoBaseDefender).toBeInBottomOfDeck(context.player1, 4);
            expect(context.specforceSoldier).toBeInBottomOfDeck(context.player1, 4);
            expect(context.regionalSympathizers).toBeInBottomOfDeck(context.player1, 4);
            expect(context.atst).toBeInZone('discard');
            expect(context.wampa).toBeInZone('discard');
            expect(context.restock).toBeInZone('discard');
            expect(context.resupply).toBeInZone('discard');

            const battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(4);

            const opponentBattleDroids = context.player2.findCardsByName('battle-droid');
            expect(opponentBattleDroids.length).toBe(0);
        });

        it('should not prompt if there are no units in the discard pile', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['reprocess', 'reprocess'],
                    groundArena: ['pyke-sentinel'],
                    spaceArena: ['cartel-spacer'],
                    discard: [
                        'resupply',
                        'restock',
                    ]
                },
                player2: {
                    hand: ['vanquish'],
                }
            });

            const { context } = contextRef;

            const [firstReprocess, secondReprocess] = context.player1.findCardsByName('reprocess');
            context.player1.clickCard(firstReprocess);
            expect(context.player2).toBeActivePlayer();
            expect(context.restock).toBeInZone('discard');
            expect(context.resupply).toBeInZone('discard');
            let battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(0);

            // we put a unit in the discard pile
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.pykeSentinel);
            expect(context.pykeSentinel).toBeInZone('discard');

            context.player1.clickCard(secondReprocess);
            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel]);
            expect(context.player1).toHaveChooseNoTargetButton();
            context.player1.clickPrompt('Choose no target');
            context.player1.clickPrompt('Done');
            expect(context.pykeSentinel).toBeInZone('discard');
            battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
