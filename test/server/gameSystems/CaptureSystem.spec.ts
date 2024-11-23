describe('Capture mechanic', function() {
    integration(function (contextRef) {
        describe('When a unit is captured', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['discerning-veteran']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['vanquish', 'waylay']
                    }
                });

                const { context } = contextRef;

                // capture Wampa with Discerning Veteran
                context.player1.clickCard(context.discerningVeteran);
            });

            it('it should be in the captor\'s capture zone', function () {
                const { context } = contextRef;

                expect(context.wampa).toBeCapturedBy(context.discerningVeteran);
            });

            it('and the captor is defeated, it should return to its owner\'s arena exhausted', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                expect(context.discerningVeteran).toBeInZone('discard');
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.wampa.exhausted).toBeTrue();
            });

            it('and the captor is returned to hand, it should return to its owner\'s arena exhausted', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.waylay);
                expect(context.discerningVeteran).toBeInZone('hand');
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.wampa.exhausted).toBeTrue();
            });
        });

        it('When multiple units are captured, they should all be in the capture zone and all rescued on capture defeat', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['discerning-veteran', 'take-captive'],
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    hand: ['vanquish']
                }
            });

            const { context } = contextRef;

            // capture Wampa with Discerning Veteran
            context.player1.clickCard(context.discerningVeteran);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeCapturedBy(context.discerningVeteran);

            context.player2.passAction();

            // capture AT-ST with Discerning Veteran
            context.player1.clickCard(context.takeCaptive);
            expect(context.atst).toBeCapturedBy(context.discerningVeteran);
            expect(context.wampa).toBeCapturedBy(context.discerningVeteran);

            // defeat Discerning Veteran, both units rescued
            context.player2.clickCard(context.vanquish);
            expect(context.atst).toBeInZone('groundArena');
            expect(context.wampa).toBeInZone('groundArena');
            expect(context.atst.exhausted).toBeTrue();
            expect(context.wampa.exhausted).toBeTrue();
        });

        it('When a unit is captured that has upgrades and its own captured unit, the upgrades are defeated and the unit is rescued', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['discerning-veteran'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: [{ card: 'wampa', upgrades: ['academy-training'] }],
                    hand: ['take-captive']
                }
            });

            const { context } = contextRef;

            context.player1.passAction();

            // capture marine with wampa
            context.player2.clickCard(context.takeCaptive);

            // capture wampa with discerning veteran
            context.player1.clickCard(context.discerningVeteran);

            expect(context.wampa).toBeCapturedBy(context.discerningVeteran);
            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.academyTraining).toBeInZone('discard');
        });
    });
});
