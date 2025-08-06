describe('All Wings Report In', function() {
    integration(function(contextRef) {
        describe('All Wings Report In\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['all-wings-report-in'],
                        groundArena: ['wampa'],
                        spaceArena: ['alliance-xwing', 'red-three#unstoppable']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['tieln-fighter', 'devastating-gunship']
                    }
                });
            });

            it('should exhaust up to 2 friendly space units and create a X-wing token units', function () {
                const { context } = contextRef;

                // Assert game state
                expect(context.allianceXwing.exhausted).toBe(false);
                expect(context.redThree.exhausted).toBe(false);

                // Play All Wings Report In
                context.player1.clickCard(context.allWingsReportIn);

                // Exhaust up to 2 friendly space units
                expect(context.player1).toHavePrompt('Exhaust up to 2 friendly space units. For each unit exhausted this way, create an X-Wing token');
                expect(context.player1).toHaveChooseNothingButton();

                // Select a space unit
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.redThree]);
                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.redThree);
                context.player1.clickDone();

                // Create X-Wing tokens and assert it is exhausted
                const xwings = context.player1.findCardsByName('xwing');
                expect(xwings.length).toBe(2);
                expect(xwings).toAllBeInZone('spaceArena');
                expect(xwings.every((token) => token.exhausted)).toBeTrue();
                expect(context.allianceXwing.exhausted).toBe(true);
                expect(context.redThree.exhausted).toBe(true);
            });

            it('should create no X-wing token units as there is no friendly space units ready', function () {
                const { context } = contextRef;

                // Assert game state
                context.exhaustCard(context.allianceXwing);
                context.exhaustCard(context.redThree);

                expect(context.allianceXwing.exhausted).toBe(true);
                expect(context.redThree.exhausted).toBe(true);

                // Play All Wings Report In
                context.player1.clickCard(context.allWingsReportIn);

                // No X-Wing tokens created
                const xwings = context.player1.findCardsByName('xwing');
                expect(xwings.length).toBe(0);
                expect(context.allianceXwing.exhausted).toBe(true);
                expect(context.redThree.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            it('should create one X-wing token units as there is only one friendly space unit ready', function () {
                const { context } = contextRef;

                // Assert game state
                context.exhaustCard(context.allianceXwing);

                expect(context.allianceXwing.exhausted).toBe(true);
                expect(context.redThree.exhausted).toBe(false);

                // Play All Wings Report In
                context.player1.clickCard(context.allWingsReportIn);

                expect(context.player1).toHavePrompt('Exhaust up to 2 friendly space units. For each unit exhausted this way, create an X-Wing token');
                expect(context.player1).toHaveChooseNothingButton();

                // Select a space unit
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.redThree]);
                context.player1.clickCardNonChecking(context.allianceXwing);
                context.player1.clickCard(context.redThree);
                context.player1.clickDone();

                // No X-Wing tokens created
                const xwings = context.player1.findCardsByName('xwing');
                expect(xwings.length).toBe(1);
                expect(context.allianceXwing.exhausted).toBe(true);
                expect(context.redThree.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
