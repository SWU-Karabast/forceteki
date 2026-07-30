describe('Cunning Ploy', function() {
    integration(function(contextRef) {
        describe('its "look at hand and discard" effect', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['cunning-ploy']
                    },
                    player2: {
                        hand: ['wampa', 'atst'],
                        deck: ['pyke-sentinel']
                    }
                });
            });

            it('should let the controller discard a chosen card from the opponent\'s hand and have the opponent draw a replacement card', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.cunningPloy);

                expect(context.player1).toHavePrompt('Discard a card. If you do, that player draws a card.');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.wampa, context.atst]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.wampa);

                // The chosen card is discarded and the opponent draws a replacement
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.pykeSentinel).toBeInZone('hand', context.player2);
                expect(context.player2.handSize).toBe(2);

                // No enemy units or friendly units exist, so the rest of the ability has no legal targets
                expect(context.player2).toBeActivePlayer();
            });

            it('should not have the opponent draw a card if the controller declines to discard', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.cunningPloy);

                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                context.player1.clickPrompt('Take nothing');

                // No card was discarded, so no card is drawn
                expect(context.wampa).toBeInZone('hand', context.player2);
                expect(context.atst).toBeInZone('hand', context.player2);
                expect(context.pykeSentinel).toBeInZone('deck', context.player2);
                expect(context.player2.handSize).toBe(2);

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should skip the discard/draw step when the opponent\'s hand is empty, and still resolve the rest of the ability', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['cunning-ploy'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    hand: [],
                    groundArena: ['sundari-peacekeeper']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.cunningPloy);

            // Opponent's hand is empty, so the look-at-hand step has no legal target and is skipped;
            // the ability proceeds directly to the mandatory exhaust step
            expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper]);
            context.player1.clickCard(context.sundariPeacekeeper);
            expect(context.sundariPeacekeeper.exhausted).toBe(true);

            // The optional attack step still resolves normally
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(6); // 3 power + 3 from the attack buff

            expect(context.player2).toBeActivePlayer();
        });

        describe('its "exhaust an enemy unit" effect', function() {
            it('should mandatorily exhaust a ready enemy unit without offering a pass option', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['cunning-ploy']
                    },
                    player2: {
                        hand: [], // Empty hand skips the discard effect, isolating the exhaust step
                        groundArena: ['sundari-peacekeeper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cunningPloy);

                expect(context.player1).toHavePrompt('Exhaust an enemy unit');
                expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper]);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.sundariPeacekeeper);
                expect(context.sundariPeacekeeper.exhausted).toBe(true);

                expect(context.player2).toBeActivePlayer();
            });

            it('should skip the exhaust step when there are no enemy units in play, and still resolve the discard and attack effects', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['cunning-ploy'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['wampa'],
                        deck: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cunningPloy);

                // Effect 1 still resolves
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.wampa]
                });
                context.player1.clickCardInDisplayCardPrompt(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.pykeSentinel).toBeInZone('hand', context.player2);

                // No enemy units exist, so the exhaust step has no legal target and is skipped

                // Effect 3 still resolves
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(6); // 3 power + 3 from the attack buff

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('its "may attack with a unit" effect', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['cunning-ploy'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: [],
                        groundArena: ['sundari-peacekeeper']
                    }
                });
            });

            it('should allow the controller to attack with a unit and give it +3/+0 for that attack', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.cunningPloy);
                context.player1.clickCard(context.sundariPeacekeeper); // Resolve the mandatory exhaust step

                expect(context.player1).toHavePrompt('Attack with a unit. It gets +3/+0 for this attack');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(6); // 3 power + 3 from the attack buff
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the controller to decline the optional attack', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.cunningPloy);
                context.player1.clickCard(context.sundariPeacekeeper); // Resolve the mandatory exhaust step

                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.p2Base.damage).toBe(0);
                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('should only apply the +3/+0 buff for that single attack', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.cunningPloy);
                context.player1.clickCard(context.sundariPeacekeeper); // Resolve the mandatory exhaust step
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(6); // 3 power + 3 from the attack buff

                // Attack again outside of Cunning Ploy's effect to confirm the buff is gone
                context.readyCard(context.battlefieldMarine);
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(9); // 6 + printed power of 3, no buff this time
            });
        });

        it('should not allow the enemy unit exhausted by the previous effect to be selected as the attacker', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['cunning-ploy'],
                    // Wampa starts exhausted to confirm only ready units can attack
                    groundArena: [{ card: 'wampa', exhausted: true }, 'battlefield-marine']
                },
                player2: {
                    hand: [],
                    groundArena: ['sundari-peacekeeper']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.cunningPloy);
            context.player1.clickCard(context.sundariPeacekeeper); // Resolve the mandatory exhaust step
            expect(context.sundariPeacekeeper.exhausted).toBe(true);

            // The already-exhausted friendly Wampa and the just-exhausted enemy unit are both excluded;
            // only the ready friendly unit is a legal attacker
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(6); // 3 power + 3 from the attack buff

            expect(context.player2).toBeActivePlayer();
        });

        it('should resolve all three effects in sequence on a single play', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['cunning-ploy'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    hand: ['wampa'],
                    groundArena: ['sundari-peacekeeper'],
                    deck: ['pyke-sentinel']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.cunningPloy);

            // Effect 1: look at the opponent's hand and discard a card, they draw a replacement
            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.wampa]
            });
            context.player1.clickCardInDisplayCardPrompt(context.wampa);
            expect(context.wampa).toBeInZone('discard', context.player2);
            expect(context.pykeSentinel).toBeInZone('hand', context.player2);

            // Effect 2: mandatorily exhaust an enemy unit
            expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper]);
            context.player1.clickCard(context.sundariPeacekeeper);
            expect(context.sundariPeacekeeper.exhausted).toBe(true);

            // Effect 3: may attack with a unit, gaining +3/+0 for that attack
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(6); // 3 power + 3 from the attack buff

            expect(context.player2).toBeActivePlayer();
        });
    });
});
