
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
                        base: 'data-vault',
                        resources: ['confiscate', 'wampa', 'dogmatic-shock-squad', 'unveiled-might', 'when-has-become-now', 'wampa', 'wampa', 'atst', 'underworld-thug', 'wampa'],
                        deck: ['pyke-sentinel', 'moisture-farmer']
                    }
                });

                const { context } = contextRef;

                // Deploy Palpatine
                context.player1.clickCard(context.chancellorPalpatine);
                context.player1.clickPrompt('Deploy Chancellor Palpatine');
                expect(context.chancellorPalpatine).toBeInZone('groundArena');
                expect(context.player1).toHaveExactPromptButtons(['The next card you play using Plot this phase costs 3 less.', 'Play Dogmatic Shock Squad using Plot', 'Play Unveiled Might using Plot']);

                // Reduce the next card played using Plot by 3
                context.player1.clickPrompt('The next card you play using Plot this phase costs 3 less.');

                // Play Dogmatic for 3
                context.player1.clickPrompt('Play Dogmatic Shock Squad using Plot');
                context.player1.clickPrompt('Trigger');
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.dogmaticShockSquad).toBeInZone('groundArena');

                // Play Unveiled Might for 4
                expect(context.player1).toHavePassAbilityPrompt('Play Unveiled Might using Plot');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.chancellorPalpatine, context.dogmaticShockSquad]);
                context.player1.clickCard(context.dogmaticShockSquad);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.unveiledMight).toBeAttachedTo(context.dogmaticShockSquad);
                expect(context.moistureFarmer).toBeInZone('resource');

                expect(context.player2).toBeActivePlayer();
            });

            it('should reduce the cost of the next card played using Plot by 3 when played after another Plot', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'chancellor-palpatine#how-liberty-dies',
                        base: 'data-vault',
                        resources: ['confiscate', 'wampa', 'dogmatic-shock-squad', 'unveiled-might', 'when-has-become-now', 'wampa', 'wampa', 'atst', 'underworld-thug', 'wampa'],
                        deck: ['pyke-sentinel', 'moisture-farmer']
                    }
                });

                const { context } = contextRef;

                // Deploy Palpatine
                context.player1.clickCard(context.chancellorPalpatine);
                context.player1.clickPrompt('Deploy Chancellor Palpatine');
                expect(context.chancellorPalpatine).toBeInZone('groundArena');
                expect(context.player1).toHaveExactPromptButtons(['The next card you play using Plot this phase costs 3 less.', 'Play Dogmatic Shock Squad using Plot', 'Play Unveiled Might using Plot']);

                // Play Dogmatic for 6
                context.player1.clickPrompt('Play Dogmatic Shock Squad using Plot');
                context.player1.clickPrompt('Trigger');
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.dogmaticShockSquad).toBeInZone('groundArena');

                // Reduce the next card played using Plot by 3
                context.player1.clickPrompt('The next card you play using Plot this phase costs 3 less.');

                // Play Unveiled Might for 1
                expect(context.player1).toHavePassAbilityPrompt('Play Unveiled Might using Plot');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.chancellorPalpatine, context.dogmaticShockSquad]);
                context.player1.clickCard(context.dogmaticShockSquad);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.unveiledMight).toBeAttachedTo(context.dogmaticShockSquad);
                expect(context.moistureFarmer).toBeInZone('resource');

                expect(context.player2).toBeActivePlayer();
            });

            it('should not reduce an opponent\'s Plot card if the floating discount is left unused', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'chancellor-palpatine#how-liberty-dies',
                        base: 'data-vault',
                        resources: 10
                    },
                    player2: {
                        leader: 'cal-kestis#i-cant-keep-hiding',
                        base: 'data-vault',
                        resources: ['wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'unveiled-might'],
                    }
                });

                const { context } = contextRef;

                // Deploy Palpatine
                context.player1.clickCard(context.chancellorPalpatine);
                context.player1.clickPrompt('Deploy Chancellor Palpatine');

                expect(context.player2).toBeActivePlayer();
                context.player2.clickCard(context.calKestis);
                context.player2.clickPrompt('Deploy Cal Kestis');

                expect(context.player2).toHavePassAbilityPrompt('Play Unveiled Might using Plot');
                context.player2.clickPrompt('Trigger');
                expect(context.player2).toBeAbleToSelectExactly([context.chancellorPalpatine, context.calKestis]);
                context.player2.clickCard(context.calKestis);
                expect(context.player2.exhaustedResourceCount).toBe(4);
                expect(context.unveiledMight).toBeAttachedTo(context.calKestis);
            });

            it('should not reduce the cost of the next card played with the Plot keyword if it\'s played from hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'chancellor-palpatine#how-liberty-dies',
                        hand: ['dogmatic-shock-squad'],
                        resources: 10
                    }
                });

                const { context } = contextRef;

                // Deploy Palpatine
                context.player1.clickCard(context.chancellorPalpatine);
                context.player1.clickPrompt('Deploy Chancellor Palpatine');
                expect(context.chancellorPalpatine).toBeInZone('groundArena');

                context.player2.passAction();

                // Check that Dogmatic was not reduced
                context.player1.clickCard(context.dogmaticShockSquad);
                expect(context.player1.exhaustedResourceCount).toBe(6);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not reduce the cost of the next card played with the Smuggle keyword', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'chancellor-palpatine#how-liberty-dies',
                        resources: ['wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'covert-strength']
                    }
                });

                const { context } = contextRef;

                // Deploy Palpatine
                context.player1.clickCard(context.chancellorPalpatine);
                context.player1.clickPrompt('Deploy Chancellor Palpatine');
                expect(context.chancellorPalpatine).toBeInZone('groundArena');

                context.player2.passAction();

                // Check that Covert Strength was not reduced
                context.player1.clickCard(context.covertStrength);
                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.player1.exhaustedResourceCount).toBe(3);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
