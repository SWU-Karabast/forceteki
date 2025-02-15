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
                    ],
                    deck: [
                        'atst',
                        'waylay',
                        'wampa',
                        'frontier-atrt'
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
            ]);
            expect(context.player1).toHaveChooseNoTargetButton();
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.echoBaseDefender);
            context.player1.clickCard(context.specforceSoldier);
            context.player1.clickCard(context.regionalSympathizers);
            context.player1.clickPrompt('Done');

            expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 4);
            expect(context.echoBaseDefender).toBeInBottomOfDeck(context.player1, 4);
            expect(context.specforceSoldier).toBeInBottomOfDeck(context.player1, 4);
            expect(context.regionalSympathizers).toBeInBottomOfDeck(context.player1, 4);

            const battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(4);
        });
    });
});
