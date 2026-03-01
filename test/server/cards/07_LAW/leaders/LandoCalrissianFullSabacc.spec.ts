describe('Lando Calrissian, Full Sabacc', () => {
    integration(function(contextRef) {
        describe('Undeployed leader-side action ability', function() {
            it('chooses an Aspect and discards a card the player\'s deck. If the discarded card has the chosen Aspect, it creates a Credit token', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'lando-calrissian#full-sabacc',
                        resources: 5,
                        deck: ['jam-communications']
                    },
                    player2: {
                        deck: ['resupply']
                    }
                });

                const { context } = contextRef;

                // Use Lando's leader-side ability
                context.player1.clickCard(context.landoCalrissian);
                expect(context.player1).toHavePrompt('Choose an option from the list');
                expect(context.player1).toHaveExactDropdownListOptions([
                    'Vigilance',
                    'Command',
                    'Aggression',
                    'Cunning',
                    'Villainy',
                    'Heroism'
                ]);
                context.player1.chooseListOption('Cunning');

                // Choose deck prompt
                expect(context.player1).toHavePrompt('Choose a deck to discard from');
                expect(context.player1).toHaveExactPromptButtons(['Your deck', 'Opponent\'s deck']);
                context.player1.clickPrompt('Your deck');

                // Check top card discarded
                expect(context.jamCommunications).toBeInZone('discard', context.player1);
                expect(context.resupply).toBeInZone('deck', context.player2); // Sanity check, no discard for P2

                // Check Credit token created, costs paid
                expect(context.player1.credits).toBe(1);
                expect(context.landoCalrissian.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('chooses an Aspect and discards a card the opponent\'s deck. If the discarded card has the chosen Aspect, it creates a Credit token', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'lando-calrissian#full-sabacc',
                        resources: 5,
                        deck: ['jam-communications']
                    },
                    player2: {
                        deck: ['resupply']
                    }
                });

                const { context } = contextRef;

                // Use Lando's leader-side ability
                context.player1.clickCard(context.landoCalrissian);
                expect(context.player1).toHavePrompt('Choose an option from the list');
                expect(context.player1).toHaveExactDropdownListOptions([
                    'Vigilance',
                    'Command',
                    'Aggression',
                    'Cunning',
                    'Villainy',
                    'Heroism'
                ]);
                context.player1.chooseListOption('Command');

                // Choose deck prompt
                expect(context.player1).toHavePrompt('Choose a deck to discard from');
                expect(context.player1).toHaveExactPromptButtons(['Your deck', 'Opponent\'s deck']);
                context.player1.clickPrompt('Opponent\'s deck');

                // Check top card discarded
                expect(context.resupply).toBeInZone('discard', context.player2);
                expect(context.jamCommunications).toBeInZone('deck', context.player1); // Sanity check, no discard for P1

                // Check Credit token created, costs paid
                expect(context.player1.credits).toBe(1);
                expect(context.landoCalrissian.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('does not create a Credit token if the discarded card does not have the chosen Aspect', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'lando-calrissian#full-sabacc',
                        resources: 5,
                        deck: ['resupply']
                    }
                });

                const { context } = contextRef;

                // Use Lando's leader-side ability
                context.player1.clickCard(context.landoCalrissian);
                context.player1.chooseListOption('Heroism');
                context.player1.clickPrompt('Your Deck');

                // Check top card discarded
                expect(context.resupply).toBeInZone('discard', context.player1);

                // Check no Credit token created, costs paid
                expect(context.player1.credits).toBe(0);
                expect(context.landoCalrissian.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('can be used to no effect if the player has no cards in their deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'lando-calrissian#full-sabacc',
                        resources: 5,
                        deck: []
                    }
                });

                const { context } = contextRef;

                // Use Lando's leader-side ability
                context.player1.clickCard(context.landoCalrissian);
                context.player1.chooseListOption('Aggression');
                context.player1.clickPrompt('Your deck');

                // Check costs paid, no Credit token created
                expect(context.player1.credits).toBe(0);
                expect(context.landoCalrissian.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('can be used to no effect if neither player has any cards in their deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'lando-calrissian#full-sabacc',
                        resources: 5,
                        deck: []
                    },
                    player2: {
                        deck: []
                    }
                });

                const { context } = contextRef;

                // Use Lando's leader-side ability
                context.player1.clickCard(context.landoCalrissian);
                context.player1.chooseListOption('Aggression');
                context.player1.clickPrompt('Opponent\'s deck');

                // Check costs paid, no Credit token created
                expect(context.player1.credits).toBe(0);
                expect(context.landoCalrissian.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });

        describe('When Deployed triggered ability', function() {
            it('defeats a friendly Credit token to create 3 Credit tokens', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'lando-calrissian#full-sabacc',
                        credits: 1,
                    },
                    player2: {
                        credits: 1
                    }
                });

                const { context } = contextRef;
                const p1Credit = context.player1.findCardByName('credit');

                // Deploy Lando
                context.player1.clickCard(context.landoCalrissian);
                context.player1.clickPrompt('Deploy Lando Calrissian');

                // Ability triggers
                expect(context.player1).toHavePassAbilityPrompt('Defeat a friendly Credit token to create 3 Credit tokens');
                context.player1.clickPrompt('Trigger');

                // Check Credit token defeated and 3 created
                expect(p1Credit).toBeInZone('outsideTheGame');
                expect(context.player1.credits).toBe(3);
                expect(context.player2.credits).toBe(1); // Unchanged
            });

            it('can be passed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'lando-calrissian#full-sabacc',
                        credits: 1,
                    },
                    player2: {
                        credits: 1
                    }
                });

                const { context } = contextRef;

                // Deploy Lando
                context.player1.clickCard(context.landoCalrissian);
                context.player1.clickPrompt('Deploy Lando Calrissian');

                // Ability triggers
                expect(context.player1).toHavePassAbilityPrompt('Defeat a friendly Credit token to create 3 Credit tokens');
                context.player1.clickPrompt('Pass');

                // Check no Credit tokens created
                expect(context.player1.credits).toBe(1);
            });

            it('is automatically skipped if no friendly Credit tokens are in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'lando-calrissian#full-sabacc'
                    },
                    player2: {
                        credits: 1
                    }
                });

                const { context } = contextRef;

                // Deploy Lando
                context.player1.clickCard(context.landoCalrissian);
                context.player1.clickPrompt('Deploy Lando Calrissian');

                // No ability prompt, it is P2's turn
                expect(context.player1.credits).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});