describe('A Precarious Predicament', function() {
    integration(function(contextRef) {
        describe('when the opponent does not say "It could be worse"', function() {
            it('should return a unit to its owner\'s hand when controlled by opponent and owned by player', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['a-precarious-predicament'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['wampa', { card: 'battlefield-marine', owner: 'player1' }],
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true },
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.aPrecariousPredicament);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa, context.battlefieldMarine]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toHaveEnabledPromptButtons(['Return Battlefield Marine to its owner\'s hand', 'Opponent can play It\'s Worse from their hand or resources for free']);

                context.player2.clickPrompt('Return Battlefield Marine to opponent\'s hand');
                expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
            });

            it('should return a unit to its owner\'s hand when controlled and owned by opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['a-precarious-predicament'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['wampa', { card: 'battlefield-marine', owner: 'player1' }],
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true },
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.aPrecariousPredicament);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa, context.battlefieldMarine]);

                context.player1.clickCard(context.wampa);
                expect(context.player2).toHaveEnabledPromptButtons(['Return Wampa to your hand', 'Opponent can play It\'s Worse from their hand or resources for free']);

                context.player2.clickPrompt('Return Wampa to your hand');
                expect(context.wampa).toBeInZone('hand', context.player2);
            });

            it('should return a unit to its owner\'s hand when controlled and owned by player', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['a-precarious-predicament'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['wampa', { card: 'battlefield-marine', owner: 'player1' }],
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true },
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.aPrecariousPredicament);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa, context.battlefieldMarine]);

                context.player1.clickCard(context.pykeSentinel);
                expect(context.player2).toHaveEnabledPromptButtons(['Return Pyke Sentinel to opponent\'s hand', 'Opponent can play It\'s Worse from their hand or resources for free']);

                context.player2.clickPrompt('Return Pyke Sentinel to opponent\'s hand');
                expect(context.pykeSentinel).toBeInZone('hand', context.player1);
            });
        });

        describe('when the opponent says "It could be worse"', function() {
            it('should allow to play It\'s Worse for free from the hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['a-precarious-predicament', 'its-worse'],
                        groundArena: ['pyke-sentinel'],
                        base: 'level-1313',
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
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa, context.battlefieldMarine]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toHaveEnabledPromptButtons(['Return Battlefield Marine to opponent\'s hand', 'Opponent can play It\'s Worse from their hand or resources for free']);

                context.player2.clickPrompt('Opponent can play It\'s Worse from their hand or resources for free');
                expect(context.player1).toBeAbleToSelectExactly([itsWorseHand, itsWorseResource]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(itsWorseHand);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.player1.resources.length).toBe(2);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('should allow to play It\'s Worse for free from the resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['a-precarious-predicament', 'its-worse'],
                        groundArena: ['pyke-sentinel'],
                        base: 'level-1313',
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
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa, context.battlefieldMarine]);

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
            });

            it('should allow to choose not to play It\'s Worse', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['a-precarious-predicament', 'its-worse'],
                        groundArena: ['pyke-sentinel'],
                        base: 'level-1313',
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
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa, context.battlefieldMarine]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toHaveEnabledPromptButtons(['Return Battlefield Marine to opponent\'s hand', 'Opponent can play It\'s Worse from their hand or resources for free']);

                context.player2.clickPrompt('Opponent can play It\'s Worse from their hand or resources for free');
                expect(context.player1).toBeAbleToSelectExactly([itsWorseHand, itsWorseResource]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickPrompt('Choose Nothing');
                expect(context.player1.resources.length).toBe(2);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.player1.handSize).toBe(1);
            });
        });
    });
});
