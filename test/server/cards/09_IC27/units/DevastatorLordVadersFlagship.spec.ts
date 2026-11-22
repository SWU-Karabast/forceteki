describe('Devastator, Lord Vader\'s Flagship', function () {
    integration(function (contextRef) {
        describe('Devastator\'s When Played ability', function () {
            it('should search the top 5 cards for a Villainy unit that costs 12 or less and play it for free ignoring aspect penalties', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['devastator#lord-vaders-flagship'],
                        deck: [
                            'bossk#hunt-by-instinct',
                            'indoctrinated-conscript',
                            'wampa',
                            'apology-accepted',
                            'a-fine-addition',
                            'deceptive-shade',
                            'battlefield-marine'
                        ],
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'echo-base'
                    }
                });
                const { context } = contextRef;

                // Play Devastator and search the top 5 cards
                context.player1.clickCard(context.devastator);
                expect(context.player1).toHavePrompt('Choose a Villainy unit that costs 12 or less to play for free');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.bossk, context.indoctrinatedConscript],
                    invalid: [context.wampa, context.apologyAccepted, context.aFineAddition]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // Play Bossk for free
                context.player1.clickCardInDisplayCardPrompt(context.bossk);
                expect(context.bossk).toBeInZone('groundArena', context.player1);
                expect(context.devastator).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(10);
                expect(context.getChatLog()).toEqual('player1 plays Bossk from their deck');

                // Remaining searched cards go to the bottom of the deck
                expect([context.indoctrinatedConscript, context.wampa, context.apologyAccepted, context.aFineAddition]).toAllBeInBottomOfDeck(context.player1, 4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow a Villainy unit costing exactly 12 but not a non-Villainy unit costing 12', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['devastator#lord-vaders-flagship'],
                        deck: [
                            'supremacy#of-unimaginable-size',
                            'gor#grievouss-pet',
                            'wampa',
                            'battlefield-marine',
                            'apology-accepted'
                        ],
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'echo-base'
                    }
                });
                const { context } = contextRef;

                // Play Devastator and search the top 5 cards
                context.player1.clickCard(context.devastator);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.supremacy],
                    invalid: [context.gor, context.wampa, context.battlefieldMarine, context.apologyAccepted]
                });

                // Play Supremacy for free
                context.player1.clickCardInDisplayCardPrompt(context.supremacy);
                expect(context.supremacy).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(10);

                // Remaining searched cards go to the bottom of the deck
                expect([context.gor, context.wampa, context.battlefieldMarine, context.apologyAccepted]).toAllBeInBottomOfDeck(context.player1, 4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow taking nothing and put all searched cards on the bottom of the deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['devastator#lord-vaders-flagship'],
                        deck: [
                            'bossk#hunt-by-instinct',
                            'indoctrinated-conscript',
                            'wampa',
                            'apology-accepted',
                            'a-fine-addition'
                        ],
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'echo-base'
                    }
                });
                const { context } = contextRef;

                // Play Devastator and take nothing
                context.player1.clickCard(context.devastator);
                context.player1.clickPrompt('Take nothing');

                // All searched cards go to the bottom of the deck
                expect(context.bossk).toBeInZone('deck', context.player1);
                expect(context.indoctrinatedConscript).toBeInZone('deck', context.player1);
                expect([context.bossk, context.indoctrinatedConscript, context.wampa, context.apologyAccepted, context.aFineAddition]).toAllBeInBottomOfDeck(context.player1, 5);
                expect(context.player1.exhaustedResourceCount).toBe(10);
                expect(context.player2).toBeActivePlayer();
            });

            it('should resolve the played unit\'s own triggered abilities (Ambush)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['devastator#lord-vaders-flagship'],
                        deck: ['greedo#bigtimer', 'wampa', 'apology-accepted', 'a-fine-addition', 'repair'],
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['porg']
                    }
                });
                const { context } = contextRef;

                // Play Devastator and play Greedo for free
                context.player1.clickCard(context.devastator);
                context.player1.clickCardInDisplayCardPrompt(context.greedo);

                // Trigger Greedo's Ambush against Porg
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.porg);

                // Porg is defeated and Greedo takes damage
                expect(context.porg).toBeInZone('discard', context.player2);
                expect(context.greedo).toBeInZone('groundArena', context.player1);
                expect(context.greedo.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should play a Piloting unit as a unit without a unit/upgrade choice', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['devastator#lord-vaders-flagship'],
                        spaceArena: ['green-squadron-awing'],
                        deck: ['bossk#hunt-by-instinct', 'wampa', 'apology-accepted', 'a-fine-addition', 'repair'],
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'echo-base'
                    }
                });
                const { context } = contextRef;

                // Play Devastator and search the top 5 cards
                context.player1.clickCard(context.devastator);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.bossk],
                    invalid: [context.wampa, context.apologyAccepted, context.aFineAddition, context.repair]
                });

                // Bossk is played as a unit, not as an upgrade
                context.player1.clickCardInDisplayCardPrompt(context.bossk);
                expect(context.bossk).toBeInZone('groundArena', context.player1);
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames([]);
                expect(context.player1.exhaustedResourceCount).toBe(10);
                expect(context.player2).toBeActivePlayer();
            });

            it('should work with a deck smaller than 5 cards', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['devastator#lord-vaders-flagship'],
                        deck: ['bossk#hunt-by-instinct', 'wampa'],
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'echo-base'
                    }
                });
                const { context } = contextRef;

                // Play Devastator and search the whole deck
                context.player1.clickCard(context.devastator);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.bossk],
                    invalid: [context.wampa]
                });

                // Play Bossk for free
                context.player1.clickCardInDisplayCardPrompt(context.bossk);
                expect(context.bossk).toBeInZone('groundArena', context.player1);
                expect(context.wampa).toBeInZone('deck', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing with an empty deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['devastator#lord-vaders-flagship'],
                        deck: [],
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'echo-base'
                    }
                });
                const { context } = contextRef;

                // Play Devastator, the search finds nothing
                context.player1.clickCard(context.devastator);
                expect(context.devastator).toBeInZone('spaceArena', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow playing a second copy of Devastator, which triggers the uniqueness rule and its own search', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['devastator#lord-vaders-flagship'],
                        deck: [
                            'devastator#lord-vaders-flagship',
                            'wampa',
                            'apology-accepted',
                            'a-fine-addition',
                            'repair',
                            'bossk#hunt-by-instinct',
                            'indoctrinated-conscript',
                            'battlefield-marine',
                            'resupply',
                            'takedown'
                        ],
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'echo-base'
                    }
                });
                const { context } = contextRef;

                const devastators = context.player1.findCardsByName('devastator#lord-vaders-flagship');
                const handDevastator = devastators.find((card) => card.zoneName === 'hand');
                const deckDevastator = devastators.find((card) => card.zoneName === 'deck');

                // Play Devastator from hand and search for the second copy
                context.player1.clickCard(handDevastator);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [deckDevastator],
                    invalid: [context.wampa, context.apologyAccepted, context.aFineAddition, context.repair]
                });
                context.player1.clickCardInDisplayCardPrompt(deckDevastator);

                // Uniqueness rule: defeat the copy from hand
                expect(context.player1).toHavePrompt('Choose which copy of Devastator, Lord Vader\'s Flagship to defeat');
                expect(context.player1).toBeAbleToSelectExactly([handDevastator, deckDevastator]);
                context.player1.clickCard(handDevastator);
                expect(handDevastator).toBeInZone('discard', context.player1);
                expect(deckDevastator).toBeInZone('spaceArena', context.player1);

                // The new copy's When Played searches the new top 5
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.bossk, context.indoctrinatedConscript],
                    invalid: [context.battlefieldMarine, context.resupply, context.takedown]
                });
                context.player1.clickCardInDisplayCardPrompt(context.indoctrinatedConscript);
                expect(context.indoctrinatedConscript).toBeInZone('groundArena', context.player1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
