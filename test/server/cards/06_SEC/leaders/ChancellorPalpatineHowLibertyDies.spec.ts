
describe('Chancellor Palpatine, How Liberty Dies', function () {
    integration(function (contextRef) {
        describe('Chancellor Palpatine\'s undeployed ability', function () {
            it('should search the top 5 cards for a Plot card, reveal it, and draw it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'chancellor-palpatine#how-liberty-dies',
                        deck: ['confiscate', 'wampa', 'dogmatic-shock-squad', 'unveiled-might', 'when-has-become-now'],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                // Use Palpatine to search the top 5 for a Plot card
                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.player1).toHavePrompt('Select a card to reveal');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.confiscate, context.wampa, context.whenHasBecomeNow],
                    selectable: [context.dogmaticShockSquad, context.unveiledMight]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.dogmaticShockSquad);
                expect(context.getChatLogs(2)).toContain('player1 takes Dogmatic Shock Squad');
                expect(context.dogmaticShockSquad).toBeInZone('hand');
            });
        });

        describe('Chancellor Palpatine\'s deploy ability', function () {
            it('should reduce the cost of the next card played using Plot by 3', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'chancellor-palpatine#how-liberty-dies',
                        resources: ['confiscate', 'wampa', 'dogmatic-shock-squad', 'unveiled-might', 'when-has-become-now', 'wampa', 'wampa', 'atst', 'underworld-thug', 'wampa'],
                        deck: ['pyke-sentinel', 'moisture-farmer']
                    }
                });

                const { context } = contextRef;

                // Deploy Palpatine
                context.player1.clickCard(context.chancellorPalpatine);
                context.player1.clickPrompt('Deploy Chancellor Palpatine');
                expect(context.chancellorPalpatine).toBeInZone('groundArena');

                // Choose to play Dogmatic for 6
                expect(context.player1).toHaveExactPromptButtons(['The next card you play using Plot this phase costs 3 less.', 'Play Dogmatic Shock Squad using Plot', 'Play Unveiled Might using Plot']);
                context.player1.clickPrompt('Play Dogmatic Shock Squad using Plot');
                context.player1.clickPrompt('Trigger');
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.dogmaticShockSquad).toBeInZone('groundArena');
                // context.player1.clickPrompt('The next card you play using Plot this phase costs 3 less.');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
