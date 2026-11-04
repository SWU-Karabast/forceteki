describe('Dexter Jettster, Obi-Wannnn!!!', function() {
    integration(function(contextRef) {
        const abilityTitle = 'Pay 1 resource to look at the top 3 cards of your deck';
        const displayPromptTitle = 'Select card to move to the top or bottom of the deck';

        describe('his On Attack ability', function() {
            describe('when the deck has 5 cards', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: ['dexter-jettster#obiwannnn'],
                            deck: [
                                'foundling',
                                'pyke-sentinel',
                                'atst',
                                'cartel-spacer',
                                'wampa'
                            ]
                        }
                    });
                });

                it('should let the player pay 1 resource and put some of the top 3 cards on the bottom and the rest on top in any order', function() {
                    const { context } = contextRef;

                    // Attack the base and pay 1 resource
                    context.player1.clickCard(context.dexterJettster);
                    context.player1.clickCard(context.p2Base);
                    expect(context.player1).toHavePassAbilityPrompt(abilityTitle);
                    context.player1.clickPrompt('Trigger');

                    // Top 3 cards are shown
                    expect(context.player1).toHavePrompt(displayPromptTitle);
                    expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.foundling, context.pykeSentinel, context.atst]);
                    expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);

                    // Put Foundling on the bottom, then Pyke Sentinel and AT-ST on top
                    context.player1.clickDisplayCardPromptButton(context.foundling.uuid, 'bottom');
                    expect(context.player1).toHavePrompt(displayPromptTitle);
                    context.player1.clickDisplayCardPromptButton(context.pykeSentinel.uuid, 'top');
                    expect(context.player1).toHavePrompt(displayPromptTitle);
                    context.player1.clickDisplayCardPromptButton(context.atst.uuid, 'top');

                    // The last card put on top ends up as the top card
                    expect(context.player1.deck).toEqualArray([
                        context.atst,
                        context.pykeSentinel,
                        context.cartelSpacer,
                        context.wampa,
                        context.foundling
                    ]);
                    expect(context.player1.exhaustedResourceCount).toBe(1);
                    expect(context.p2Base.damage).toBe(2);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should let the player put all 3 cards on the bottom of the deck', function() {
                    const { context } = contextRef;

                    // Attack the base and pay 1 resource
                    context.player1.clickCard(context.dexterJettster);
                    context.player1.clickCard(context.p2Base);
                    expect(context.player1).toHavePassAbilityPrompt(abilityTitle);
                    context.player1.clickPrompt('Trigger');

                    // Put all 3 cards on the bottom
                    expect(context.player1).toHavePrompt(displayPromptTitle);
                    context.player1.clickDisplayCardPromptButton(context.foundling.uuid, 'bottom');
                    expect(context.player1).toHavePrompt(displayPromptTitle);
                    context.player1.clickDisplayCardPromptButton(context.pykeSentinel.uuid, 'bottom');
                    expect(context.player1).toHavePrompt(displayPromptTitle);
                    context.player1.clickDisplayCardPromptButton(context.atst.uuid, 'bottom');

                    // The 3 cards are now at the bottom in the order they were placed
                    expect(context.player1.deck).toEqualArray([
                        context.cartelSpacer,
                        context.wampa,
                        context.foundling,
                        context.pykeSentinel,
                        context.atst
                    ]);
                    expect(context.player1.exhaustedResourceCount).toBe(1);
                    expect(context.p2Base.damage).toBe(2);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should let the player put all 3 cards back on top of the deck in a new order', function() {
                    const { context } = contextRef;

                    // Attack the base and pay 1 resource
                    context.player1.clickCard(context.dexterJettster);
                    context.player1.clickCard(context.p2Base);
                    expect(context.player1).toHavePassAbilityPrompt(abilityTitle);
                    context.player1.clickPrompt('Trigger');

                    // Put all 3 cards on top
                    expect(context.player1).toHavePrompt(displayPromptTitle);
                    context.player1.clickDisplayCardPromptButton(context.foundling.uuid, 'top');
                    expect(context.player1).toHavePrompt(displayPromptTitle);
                    context.player1.clickDisplayCardPromptButton(context.pykeSentinel.uuid, 'top');
                    expect(context.player1).toHavePrompt(displayPromptTitle);
                    context.player1.clickDisplayCardPromptButton(context.atst.uuid, 'top');

                    // The top 3 cards are in the reverse of their original order
                    expect(context.player1.deck).toEqualArray([
                        context.atst,
                        context.pykeSentinel,
                        context.foundling,
                        context.cartelSpacer,
                        context.wampa
                    ]);
                    expect(context.player1.exhaustedResourceCount).toBe(1);
                    expect(context.p2Base.damage).toBe(2);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should do nothing if the player declines to pay the resource', function() {
                    const { context } = contextRef;

                    // Attack the base and decline to pay
                    context.player1.clickCard(context.dexterJettster);
                    context.player1.clickCard(context.p2Base);
                    expect(context.player1).toHavePassAbilityPrompt(abilityTitle);
                    context.player1.clickPrompt('Pass');

                    // Deck and resources are unchanged
                    expect(context.player1).not.toHavePrompt(displayPromptTitle);
                    expect(context.player1.deck).toEqualArray([
                        context.foundling,
                        context.pykeSentinel,
                        context.atst,
                        context.cartelSpacer,
                        context.wampa
                    ]);
                    expect(context.player1.exhaustedResourceCount).toBe(0);
                    expect(context.p2Base.damage).toBe(2);
                    expect(context.player2).toBeActivePlayer();
                });
            });

            it('should not be offered if the player has no ready resources', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['dexter-jettster#obiwannnn'],
                        deck: [
                            'foundling',
                            'pyke-sentinel',
                            'atst',
                            'cartel-spacer',
                            'wampa'
                        ],
                        resources: { readyCount: 0, exhaustedCount: 5 }
                    }
                });
                const { context } = contextRef;

                // Attack the base with no ready resources
                context.player1.clickCard(context.dexterJettster);
                context.player1.clickCard(context.p2Base);

                // Ability is not offered, deck and resources are unchanged
                expect(context.player1).not.toHavePassAbilityPrompt(abilityTitle);
                expect(context.player1.deck).toEqualArray([
                    context.foundling,
                    context.pykeSentinel,
                    context.atst,
                    context.cartelSpacer,
                    context.wampa
                ]);
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should only show the 2 cards if the deck has 2 cards', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['dexter-jettster#obiwannnn'],
                        deck: ['foundling', 'pyke-sentinel']
                    }
                });
                const { context } = contextRef;

                // Attack the base and pay 1 resource
                context.player1.clickCard(context.dexterJettster);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePassAbilityPrompt(abilityTitle);
                context.player1.clickPrompt('Trigger');

                // Only the 2 cards in the deck are shown
                expect(context.player1).toHavePrompt(displayPromptTitle);
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.foundling, context.pykeSentinel]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);

                // Put Pyke Sentinel on top and Foundling on the bottom
                context.player1.clickDisplayCardPromptButton(context.pykeSentinel.uuid, 'top');
                expect(context.player1).toHavePrompt(displayPromptTitle);
                context.player1.clickDisplayCardPromptButton(context.foundling.uuid, 'bottom');

                expect(context.player1.deck).toEqualArray([context.pykeSentinel, context.foundling]);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should only let the player view the card if the deck has 1 card', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['dexter-jettster#obiwannnn'],
                        deck: ['foundling']
                    }
                });
                const { context } = contextRef;

                // Attack the base and pay 1 resource
                context.player1.clickCard(context.dexterJettster);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePassAbilityPrompt(abilityTitle);
                context.player1.clickPrompt('Trigger');

                // The only card can be viewed but not moved
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.foundling]);
                context.player1.clickDone();

                expect(context.player1.deck).toEqualArray([context.foundling]);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should resolve with an empty deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['dexter-jettster#obiwannnn'],
                        deck: []
                    }
                });
                const { context } = contextRef;

                // Attack the base and pay 1 resource
                context.player1.clickCard(context.dexterJettster);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePassAbilityPrompt(abilityTitle);
                context.player1.clickPrompt('Trigger');

                // Nothing to look at, resource is still paid
                expect(context.player1.deck.length).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
