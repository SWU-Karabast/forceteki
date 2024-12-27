describe('Unexpected Escape', function() {
    integration(function(contextRef) {
        describe('Unexpected Escape\'s event ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['take-captive', 'unexpected-escape'],
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['wing-leader'],
                        hand: ['discerning-veteran', 'take-captive']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;
                const p1TakeCaptive = context.player1.findCardByName('take-captive');
                const p2TakeCaptive = context.player2.findCardByName('take-captive');

                // SETUP: P2 Discerning Veteran captures two cards, P1 TIE/LN captures one, P2 Pyke Sentinel zero
                context.player1.clickCard(p1TakeCaptive);
                context.player1.clickCard(context.tielnFighter);

                context.player2.clickCard(context.discerningVeteran);
                context.player2.clickCard(context.wampa);

                context.player1.passAction();

                // Take Captive automatically selects AT-ST
                context.player2.clickCard(p2TakeCaptive);
                context.player2.clickCard(context.discerningVeteran);

                // Discerning Veteran stays exhausted
            });

            it('can select one of multiple captured units to rescue and exhaust the captor', function() {
                const { context } = contextRef;

                // Play Unexpected Escape and target Wampa captured by Discerning Veteran
                context.player1.clickCard(context.unexpectedEscape);
                expect(context.player1).toBeAbleToSelectExactly([context.discerningVeteran, context.tielnFighter, context.pykeSentinel]);
                context.player1.clickCard(context.discerningVeteran);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickCard(context.wampa);

                expect(context.discerningVeteran.exhausted).toBeTrue();
                expect(context.wampa).not.toBeCapturedBy(context.discerningVeteran);
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.atst).toBeCapturedBy(context.discerningVeteran);
                expect(context.wingLeader).toBeCapturedBy(context.tielnFighter);

                expect(context.player2).toBeActivePlayer();
            });

            it('can pass instead of selecting one of multiple rescue targets', function() {
                const { context } = contextRef;

                // Play Unexpected Escape and target Wampa captured by Discerning Veteran
                context.player1.clickCard(context.unexpectedEscape);
                expect(context.player1).toBeAbleToSelectExactly([context.discerningVeteran, context.tielnFighter, context.pykeSentinel]);
                context.player1.clickCard(context.discerningVeteran);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickPrompt('Choose no target');

                expect(context.discerningVeteran.exhausted).toBeTrue();
                expect(context.atst).toBeCapturedBy(context.discerningVeteran);
                expect(context.wampa).toBeCapturedBy(context.discerningVeteran);
                expect(context.wingLeader).toBeCapturedBy(context.tielnFighter);

                expect(context.player2).toBeActivePlayer();
            });

            it('will automatically select the only captured unit', function() {
                const { context } = contextRef;

                // Play Unexpected Escape and target TIE/LN fighter, moves to optionally rescue the guarded Wing Leader
                context.player1.clickCard(context.unexpectedEscape);
                expect(context.player1).toBeAbleToSelectExactly([context.discerningVeteran, context.tielnFighter, context.pykeSentinel]);
                context.player1.clickCard(context.tielnFighter);
                expect(context.player1).toHavePassSingleTargetPrompt('Rescue a captured card guarded by that unit', context.wingLeader);
                context.player1.clickPrompt('Rescue a captured card guarded by that unit -> Wing Leader');

                expect(context.tielnFighter.exhausted).toBeTrue();
                expect(context.wingLeader).not.toBeCapturedBy(context.tielnFighter);
                expect(context.wingLeader).toBeInZone('spaceArena');
                expect(context.wingLeader.exhausted).toBeTrue();

                expect(context.atst).toBeCapturedBy(context.discerningVeteran);
                expect(context.wampa).toBeCapturedBy(context.discerningVeteran);

                expect(context.player2).toBeActivePlayer();
            });

            it('will allow bypassing selection of the only captured unit', function() {
                const { context } = contextRef;

                // Play Unexpected Escape and target TIE/LN fighter, moves to optionally rescue the guarded Wing Leader
                context.player1.clickCard(context.unexpectedEscape);
                expect(context.player1).toBeAbleToSelectExactly([context.discerningVeteran, context.tielnFighter, context.pykeSentinel]);
                context.player1.clickCard(context.tielnFighter);
                expect(context.player1).toHavePassSingleTargetPrompt('Rescue a captured card guarded by that unit', context.wingLeader);
                context.player1.clickPrompt('Pass');

                expect(context.tielnFighter.exhausted).toBeTrue();
                expect(context.atst).toBeCapturedBy(context.discerningVeteran);
                expect(context.wampa).toBeCapturedBy(context.discerningVeteran);
                expect(context.wingLeader).toBeCapturedBy(context.tielnFighter);

                expect(context.player2).toBeActivePlayer();
            });

            it('will exhaust a unit with no captured cards', function() {
                const { context } = contextRef;

                // Play Unexpected Escape and target Pyke Sentinel, no further target selection happens
                context.player1.clickCard(context.unexpectedEscape);
                expect(context.player1).toBeAbleToSelectExactly([context.discerningVeteran, context.tielnFighter, context.pykeSentinel]);
                context.player1.clickCard(context.pykeSentinel);

                expect(context.pykeSentinel.exhausted).toBeTrue();
                expect(context.atst).toBeCapturedBy(context.discerningVeteran);
                expect(context.wampa).toBeCapturedBy(context.discerningVeteran);
                expect(context.wingLeader).toBeCapturedBy(context.tielnFighter);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
