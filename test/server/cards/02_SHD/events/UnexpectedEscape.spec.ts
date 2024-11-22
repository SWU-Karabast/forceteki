describe('Unexpected Escape', function() {
    integration(function(contextRef) {
        describe('Unexpected Escape\'s event ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['unexpected-escape'],
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['wing-leader']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['tieln-fighter'],
                        hand: ['discerning-veteran', 'take-captive', 'take-captive']
                    }
                });

                const { context } = contextRef;
                const [takeCaptive1, takeCaptive2] = context.player2.findCardsByName('take-captive');

                // SETUP: Discerning Veteran captures two cards, TIE/LN Fighter captures one, Pyke Sentinel zero
                context.player1.passAction();
                context.player2.clickCard(context.discerningVeteran);
                context.player2.clickCard(context.wampa);

                context.player1.passAction();
                context.player2.clickCard(takeCaptive1);
                context.player2.clickCard(context.discerningVeteran);
                // Take Captive automatically selects AT-ST

                context.player1.passAction();
                context.player2.clickCard(takeCaptive2);
                // Take Captive automatically resolves to TIE/LN capturing Wing Leader

                context.discerningVeteran.exhausted = false;
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
                expect(context.player1).toHavePrompt('Rescue a nonLeaderUnit');

                expect(context.tielnFighter.exhausted).toBeTrue();
                expect(context.wingLeader).not.toBeCapturedBy(context.tielnFighter);
                expect(context.wingLeader).toBeInZone('spaceArena');
                expect(context.wingLeader.exhausted).toBeTrue();

                expect(context.atst).toBeCapturedBy(context.discerningVeteran);
                expect(context.wampa).toBeCapturedBy(context.discerningVeteran);

                expect(context.player2).toBeActivePlayer();
            });

            // TODO THIS PR: add a test confirming the pass button for one target works

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
