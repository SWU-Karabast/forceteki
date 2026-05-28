describe('Elzar Mann, Haunted by a Vision', function() {
    integration(function(contextRef) {
        describe('its constant ability', function() {
            it('should enter play ready when the controller has a Force leader', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['elzar-mann#haunted-by-a-vision'],
                        leader: 'luke-skywalker#i-can-save-him', // Force trait leader
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play Elzar Mann — Force leader condition is met
                context.player1.clickCard(context.elzarMann);

                // Elzar enters play ready
                expect(context.elzarMann.exhausted).toBeFalse();
                expect(context.elzarMann).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should enter play exhausted when the controller does not have a Force leader', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['elzar-mann#haunted-by-a-vision'],
                        leader: 'the-mandalorian#we-cant-keep-running', // No Force trait
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Play Elzar Mann — Force leader condition is not met
                context.player1.clickCard(context.elzarMann);

                // Elzar enters play exhausted
                expect(context.elzarMann.exhausted).toBeTrue();
                expect(context.elzarMann).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            // These tests document intended behavior for cross-control scenarios and are pending due to a
            // known engine bug: the constant ability's condition evaluates context.player.leader, which
            // always refers to p1's leader regardless of who actually played Elzar. They should be
            // activated when the engine supports controller-relative evaluation for WildcardZoneName.Any
            // constant abilities.
            xit('should enter play ready for the opponent when they play it while controlling a Force leader', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['cloud-city-wing-guard']
                    },
                    player2: {
                        hand: ['elzar-mann#haunted-by-a-vision'],
                        groundArena: ['consular-security-force'],
                        leader: 'luke-skywalker#i-can-save-him', // Force leader
                        base: 'echo-base'
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                // Play Elzar Mann as p2 — Force leader condition is met
                context.player2.clickCard(context.elzarMann);
                context.player2.setDistributeAmongTargetsPromptState(new Map(), 'distributeAdvantage');

                // Elzar should enter play ready for p2
                expect(context.elzarMann.exhausted).toBeFalse();
                expect(context.elzarMann).toBeInZone('groundArena');
            });

            xit('should enter play exhausted for the opponent when they play it without a Force leader', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['cloud-city-wing-guard']
                    },
                    player2: {
                        hand: ['elzar-mann#haunted-by-a-vision'],
                        groundArena: ['consular-security-force'],
                        leader: 'the-mandalorian#we-cant-keep-running', // No Force trait
                        base: 'echo-base'
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();

                // Play Elzar Mann as p2 — Force leader condition is not met
                context.player2.clickCard(context.elzarMann);
                context.player2.setDistributeAmongTargetsPromptState(new Map(), 'distributeAdvantage');

                // Elzar should enter play exhausted for p2
                expect(context.elzarMann.exhausted).toBeTrue();
                expect(context.elzarMann).toBeInZone('groundArena');
            });
        });

        describe('its When Played ability', function() {
            describe('distributing Advantage tokens', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['elzar-mann#haunted-by-a-vision'],
                            groundArena: ['cloud-city-wing-guard', 'consular-security-force'],
                            spaceArena: ['cartel-spacer'],
                            leader: 'luke-skywalker#i-can-save-him', // Force leader — Elzar enters ready, no conflict triggers
                            base: 'echo-base'
                        },
                        player2: {
                            // 10-card deck: events at positions 1–5, non-events at positions 6–10
                            deck: [
                                'takedown',
                                'bamboozle',
                                'vanquish',
                                'rivals-fall',
                                'repair',
                                'pyke-sentinel',
                                'snowtrooper-lieutenant',
                                'cell-block-guard',
                                'frontier-atrt',
                                'isb-agent'
                            ]
                        }
                    });
                });

                it('should allow distributing tokens among other friendly units but not Elzar Mann himself', function() {
                    const { context } = contextRef;

                    // Play Elzar Mann
                    context.player1.clickCard(context.elzarMann);

                    // Elzar himself should not be selectable
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.cloudCityWingGuard,
                        context.consularSecurityForce,
                        context.cartelSpacer
                    ]);

                    // Distribute 5 tokens spread across three units
                    context.player1.setDistributeAmongTargetsPromptState(new Map([
                        [context.cloudCityWingGuard, 2],
                        [context.consularSecurityForce, 2],
                        [context.cartelSpacer, 1]
                    ]), 'distributeAdvantage');

                    // Verify tokens were distributed correctly
                    expect(context.cloudCityWingGuard).toHaveExactUpgradeNames(['advantage', 'advantage']);
                    expect(context.consularSecurityForce).toHaveExactUpgradeNames(['advantage', 'advantage']);
                    expect(context.cartelSpacer).toHaveExactUpgradeNames(['advantage']);
                    expect(context.elzarMann).toHaveExactUpgradeNames([]);

                    // 5 tokens distributed → opponent searches top 10 cards (2 × 5)
                    expect(context.player2).toHavePrompt('Reveal and draw an event');
                    expect(context.player2).toHaveExactDisplayPromptCards({
                        selectable: [context.takedown, context.bamboozle, context.vanquish, context.rivalsFall, context.repair],
                        invalid: [context.pykeSentinel, context.snowtrooperLieutenant, context.cellBlockGuard, context.frontierAtrt, context.isbAgent]
                    });
                    expect(context.player2).toHaveEnabledPromptButton('Take nothing');

                    // Opponent selects and is shown the revealed card
                    context.player2.clickCardInDisplayCardPrompt(context.takedown);
                    expect(context.player2).toHaveExactViewableDisplayPromptCards([context.takedown]);
                    context.player2.clickDone();

                    // Takedown is drawn into p2's hand
                    expect(context.takedown).toBeInZone('hand', context.player2);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should allow putting all 5 tokens on a single unit', function() {
                    const { context } = contextRef;

                    // Play Elzar Mann and stack all 5 tokens on one unit
                    context.player1.clickCard(context.elzarMann);
                    context.player1.setDistributeAmongTargetsPromptState(new Map([
                        [context.cloudCityWingGuard, 5]
                    ]), 'distributeAdvantage');

                    expect(context.cloudCityWingGuard).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage', 'advantage', 'advantage']);
                    expect(context.consularSecurityForce).toHaveExactUpgradeNames([]);

                    // 5 tokens distributed → opponent searches top 10 cards
                    expect(context.player2).toHavePrompt('Reveal and draw an event');
                    context.player2.clickPrompt('Take nothing');

                    expect(context.player2).toBeActivePlayer();
                });

                it('should allow distributing fewer than 5 tokens and scale the search accordingly', function() {
                    const { context } = contextRef;

                    // Play Elzar Mann and distribute only 2 tokens
                    context.player1.clickCard(context.elzarMann);
                    context.player1.setDistributeAmongTargetsPromptState(new Map([
                        [context.cloudCityWingGuard, 1],
                        [context.consularSecurityForce, 1]
                    ]), 'distributeAdvantage');

                    expect(context.cloudCityWingGuard).toHaveExactUpgradeNames(['advantage']);
                    expect(context.consularSecurityForce).toHaveExactUpgradeNames(['advantage']);

                    // 2 tokens distributed → opponent searches top 4 cards (2 × 2)
                    expect(context.player2).toHavePrompt('Reveal and draw an event');
                    expect(context.player2).toHaveExactDisplayPromptCards({
                        selectable: [context.takedown, context.bamboozle, context.vanquish, context.rivalsFall],
                        invalid: []
                    });

                    // Opponent selects and is shown the revealed card
                    context.player2.clickCardInDisplayCardPrompt(context.bamboozle);
                    expect(context.player2).toHaveExactViewableDisplayPromptCards([context.bamboozle]);
                    context.player2.clickDone();

                    expect(context.bamboozle).toBeInZone('hand', context.player2);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should not trigger the deck search when 0 tokens are distributed', function() {
                    const { context } = contextRef;

                    // Play Elzar Mann and distribute 0 tokens
                    context.player1.clickCard(context.elzarMann);
                    context.player1.setDistributeAmongTargetsPromptState(new Map(), 'distributeAdvantage');

                    // No search occurs — it is p2's turn immediately
                    expect(context.player2).toBeActivePlayer();
                    expect(context.cloudCityWingGuard).toHaveExactUpgradeNames([]);
                    expect(context.consularSecurityForce).toHaveExactUpgradeNames([]);
                    expect(context.cartelSpacer).toHaveExactUpgradeNames([]);
                });

                it('should allow the opponent to decline taking an event during the deck search', function() {
                    const { context } = contextRef;

                    // Play Elzar Mann and distribute 1 token → opponent searches top 2 cards
                    context.player1.clickCard(context.elzarMann);
                    context.player1.setDistributeAmongTargetsPromptState(new Map([
                        [context.cloudCityWingGuard, 1]
                    ]), 'distributeAdvantage');

                    expect(context.cloudCityWingGuard).toHaveExactUpgradeNames(['advantage']);

                    // Opponent may choose not to take an event
                    expect(context.player2).toHavePrompt('Reveal and draw an event');
                    context.player2.clickPrompt('Take nothing');

                    // No card drawn
                    expect(context.player2).toBeActivePlayer();
                });
            });

            it('should search exactly twice as many cards as tokens distributed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['elzar-mann#haunted-by-a-vision'],
                        groundArena: ['cloud-city-wing-guard'],
                        leader: 'luke-skywalker#i-can-save-him',
                        base: 'echo-base'
                    },
                    player2: {
                        // 7-card deck: events at positions 1, 4, 6; non-events at positions 2, 3, 5, 7
                        deck: [
                            'takedown',
                            'cell-block-guard',
                            'pyke-sentinel',
                            'bamboozle',
                            'frontier-atrt',
                            'vanquish',
                            'snowtrooper-lieutenant'
                        ]
                    }
                });

                const { context } = contextRef;

                // Play Elzar Mann and distribute 3 tokens → opponent searches top 6 cards (2 × 3)
                context.player1.clickCard(context.elzarMann);
                context.player1.setDistributeAmongTargetsPromptState(new Map([
                    [context.cloudCityWingGuard, 3]
                ]), 'distributeAdvantage');

                expect(context.cloudCityWingGuard).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);

                // Exactly 6 cards shown — the 7th card (snowtrooper-lieutenant) should not appear
                expect(context.player2).toHaveExactDisplayPromptCards({
                    selectable: [context.takedown, context.bamboozle, context.vanquish],
                    invalid: [context.cellBlockGuard, context.pykeSentinel, context.frontierAtrt]
                });

                // Opponent selects and is shown the revealed card
                context.player2.clickCardInDisplayCardPrompt(context.vanquish);
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.vanquish]);
                context.player2.clickDone();

                expect(context.vanquish).toBeInZone('hand', context.player2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not draw any card if no events exist in the searched portion of the deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['elzar-mann#haunted-by-a-vision'],
                        groundArena: ['cloud-city-wing-guard'],
                        leader: 'luke-skywalker#i-can-save-him',
                        base: 'echo-base'
                    },
                    player2: {
                        // All non-events
                        deck: ['cell-block-guard', 'pyke-sentinel', 'frontier-atrt', 'snowtrooper-lieutenant']
                    }
                });

                const { context } = contextRef;

                // Play Elzar Mann and distribute 1 token → opponent searches top 2 cards (both non-events)
                context.player1.clickCard(context.elzarMann);
                context.player1.setDistributeAmongTargetsPromptState(new Map([
                    [context.cloudCityWingGuard, 1]
                ]), 'distributeAdvantage');

                // All searched cards are invalid — opponent can only take nothing
                expect(context.player2).toHaveExactDisplayPromptCards({
                    invalid: [context.cellBlockGuard, context.pykeSentinel]
                });
                context.player2.clickPrompt('Take nothing');

                // No card drawn
                expect(context.player2).toBeActivePlayer();
                expect(context.player2.hand.length).toBe(0);
            });
        });
    });
});
