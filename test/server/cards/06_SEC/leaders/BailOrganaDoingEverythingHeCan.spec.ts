
describe('Bail Organa, Doing Everything He Can', function () {
    const bailLeaderPromptTitle = 'If a friendly unit was defeated this phase, return a friendly resource to its owner\'s hand. If you do, put the top card of your deck into play as a resource.';
    integration(function (contextRef) {
        describe('Bail Organa\'s leader side action ability', function () {
            it('will do nothing if no friendly unit was defeated this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bail-organa#doing-everything-he-can',
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        resources: 3,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bailOrgana);
                expect(context.player1).toHaveNoEffectAbilityPrompt(bailLeaderPromptTitle);
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Use it anyway');
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.entrenched).toBeInZone('deck');
            });

            it('will do nothing if an enemy unit was defeated this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bail-organa#doing-everything-he-can',
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        resources: 3,
                    },
                    player2: {
                        hand: ['takedown'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                context.player1.clickCard(context.bailOrgana);
                expect(context.player1).toHaveNoEffectAbilityPrompt(bailLeaderPromptTitle);
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Use it anyway');
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.entrenched).toBeInZone('deck');
            });

            it('will allow Bail to return a resource to hand and resource the top card of the deck if a friendly unit was defeated this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bail-organa#doing-everything-he-can',
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        groundArena: ['battlefield-marine'],
                        resources: ['wampa', 'moisture-farmer', 'pyke-sentinel'],
                    },
                    player2: {
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                context.player1.clickCard(context.bailOrgana);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.moistureFarmer, context.pykeSentinel]);
                context.player1.clickCard(context.moistureFarmer);
                expect(context.moistureFarmer).toBeInZone('hand');
                expect(context.player1.resources.length).toBe(3);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.entrenched).toBeInZone('resource');
            });

            it('will allow Bail to return a resource to hand if the deck is empty and a friendly unit was defeated this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bail-organa#doing-everything-he-can',
                        deck: [],
                        groundArena: ['battlefield-marine'],
                        resources: ['wampa', 'moisture-farmer', 'pyke-sentinel'],
                    },
                    player2: {
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                context.player1.clickCard(context.bailOrgana);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.moistureFarmer, context.pykeSentinel]);
                context.player1.clickCard(context.moistureFarmer);
                expect(context.moistureFarmer).toBeInZone('hand');
                expect(context.player1.resources.length).toBe(2);
                expect(context.player1.exhaustedResourceCount).toBe(0);
            });
        });

        describe('Bail Organa\'s deploy ability', function () {
            it('will not be active without 2 cards in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bail-organa#doing-everything-he-can',
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        resources: 4,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bailOrgana);
                expect(context.player1).toHaveNoEffectAbilityPrompt(bailLeaderPromptTitle);
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Cancel');
            });

            it('will not be active if Bail is exhausted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bail-organa#doing-everything-he-can', exhausted: true },
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        hand: ['moisture-farmer', 'wampa'],
                        resources: 4,
                    },
                });

                const { context } = contextRef;

                expect(context.bailOrgana).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('will not be active with only one card in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bail-organa#doing-everything-he-can',
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        hand: ['moisture-farmer'],
                        resources: 4,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bailOrgana);
                expect(context.player1).toHaveNoEffectAbilityPrompt(bailLeaderPromptTitle);
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Cancel');
            });

            it('must exhaust and discard 2 cards from hand to activate', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bail-organa#doing-everything-he-can',
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        hand: ['moisture-farmer', 'wampa'],
                        resources: 4,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bailOrgana);
                expect(context.player1).toHaveExactPromptButtons([bailLeaderPromptTitle, 'Deploy Bail Organa', 'Cancel']);
                context.player1.clickPrompt('Deploy Bail Organa');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.moistureFarmer]);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.moistureFarmer);
                context.player1.clickDone();
                expect(context.bailOrgana.deployed).toBe(true);
            });

            it('must exhaust and discard 2 cards from hand to activate', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bail-organa#doing-everything-he-can',
                        deck: ['pyke-sentinel', 'power-of-the-dark-side'],
                        hand: ['moisture-farmer', 'wampa'],
                        resources: 4,
                    },
                    player2: {
                        hand: ['takedown']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bailOrgana);
                expect(context.player1).toHaveExactPromptButtons([bailLeaderPromptTitle, 'Deploy Bail Organa', 'Cancel']);
                context.player1.clickPrompt('Deploy Bail Organa');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.moistureFarmer]);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.moistureFarmer);
                context.player1.clickDone();

                expect(context.wampa).toBeInZone('discard');
                expect(context.moistureFarmer).toBeInZone('discard');
                expect(context.bailOrgana.deployed).toBe(true);

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.bailOrgana);
                expect(context.bailOrgana).toBeInZone('base');

                context.moveToNextActionPhase();

                context.player1.clickCard(context.bailOrgana);
                expect(context.player1).toHaveExactPromptButtons([bailLeaderPromptTitle, 'Deploy Bail Organa', 'Cancel']);
                context.player1.clickPrompt('Deploy Bail Organa');
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.powerOfTheDarkSide]);
                context.player1.clickCard(context.pykeSentinel);
                context.player1.clickCard(context.powerOfTheDarkSide);
                context.player1.clickDone();
                expect(context.pykeSentinel).toBeInZone('discard');
                expect(context.powerOfTheDarkSide).toBeInZone('discard');
                expect(context.bailOrgana.deployed).toBe(true);
            });
        });

        describe('Bail Organa\'s deployed ability', function () {
            it('will heal 1 damage from his controller\'s base when playing a card from resources using Plot', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bail-organa#doing-everything-he-can',
                        base: { card: 'level-1313', damage: 5 },
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        hand: ['moisture-farmer', 'pyke-sentinel'],
                        resources: ['unveiled-might', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bailOrgana);
                expect(context.player1).toHaveExactPromptButtons([bailLeaderPromptTitle, 'Deploy Bail Organa', 'Cancel']);
                context.player1.clickPrompt('Deploy Bail Organa');
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.moistureFarmer]);
                context.player1.clickCard(context.pykeSentinel);
                context.player1.clickCard(context.moistureFarmer);
                context.player1.clickDone();

                expect(context.bailOrgana.deployed).toBe(true);
                expect(context.player1).toHavePassAbilityPrompt('Play Unveiled Might using Plot');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.bailOrgana);
                expect(context.unveiledMight).toBeAttachedTo(context.bailOrgana);
                expect(context.p1Base.damage).toBe(4);
            });

            it('will heal 1 damage from his controller\'s base for each card played from resources using Plot', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bail-organa#doing-everything-he-can',
                        base: { card: 'level-1313', damage: 5 },
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        hand: ['moisture-farmer', 'pyke-sentinel'],
                        resources: ['unveiled-might', 'armor-of-fortune', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bailOrgana);
                expect(context.player1).toHaveExactPromptButtons([bailLeaderPromptTitle, 'Deploy Bail Organa', 'Cancel']);
                context.player1.clickPrompt('Deploy Bail Organa');
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.moistureFarmer]);
                context.player1.clickCard(context.pykeSentinel);
                context.player1.clickCard(context.moistureFarmer);
                context.player1.clickDone();

                expect(context.bailOrgana.deployed).toBe(true);
                expect(context.player1).toHaveExactPromptButtons(['Play Unveiled Might using Plot', 'Play Armor of Fortune using Plot']);
                context.player1.clickPrompt('Play Unveiled Might using Plot');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.bailOrgana);
                expect(context.unveiledMight).toBeAttachedTo(context.bailOrgana);
                expect(context.p1Base.damage).toBe(4);

                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.bailOrgana);
                expect(context.armorOfFortune).toBeAttachedTo(context.bailOrgana);
                expect(context.p1Base.damage).toBe(3);
            });

            it('will heal 1 damage from his controller\'s base when playing a card from resources using Smuggle', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bail-organa#doing-everything-he-can', deployed: true },
                        base: { card: 'level-1313', damage: 5 },
                        resources: ['collections-starhopper', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.collectionsStarhopper);
                expect(context.collectionsStarhopper).toBeInZone('spaceArena');
                expect(context.p1Base.damage).toBe(4);
            });


            it('will heal 1 damage from his controller\'s base when playing a card from resources using a card ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bail-organa#doing-everything-he-can', deployed: true },
                        hand: ['a-precarious-predicament', 'its-worse'],
                        groundArena: ['pyke-sentinel'],
                        base: { card: 'level-1313', damage: 5 },
                        resources: ['its-worse', 'underworld-thug'],
                    },
                    player2: {
                        groundArena: ['wampa', { card: 'battlefield-marine', owner: 'player1' }],
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true },
                    }
                });
                const { context } = contextRef;

                const itsWorseHand = context.player1.findCardByName('its-worse', 'hand');
                const itsWorseResource = context.player1.findCardByName('its-worse', 'resource');

                context.player1.clickCard(context.aPrecariousPredicament);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toHaveEnabledPromptButtons(['Return Battlefield Marine to opponent\'s hand', 'Opponent can play It\'s Worse from their hand or resources for free']);

                context.player2.clickPrompt('Opponent can play It\'s Worse from their hand or resources for free');
                expect(context.player1).toBeAbleToSelectExactly([itsWorseHand, itsWorseResource]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(itsWorseResource);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.player1.resources.length).toBe(1);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.p1Base.damage).toBe(4);
            });
        });
    });
});