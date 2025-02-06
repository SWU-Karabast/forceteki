describe('Mercenary Gunship', function() {
    integration(function(contextRef) {
        describe('Mercenary Gunship\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['mercenary-gunship'],
                    }
                });
            });

            it('can be taken control of by either player', function () {
                const { context } = contextRef;

                const p1Resources = context.player1.readyResourceCount;
                const p2Resources = context.player1.readyResourceCount;

                context.player1.passAction();

                // Check that Player 2 can take control
                context.player2.clickCard(context.mercenaryGunship);
                expect(context.mercenaryGunship).toBeInZone('spaceArena', context.player2);
                expect(context.player2.readyResourceCount).toBe(p2Resources - 4);

                // Check that Player 1 can take control back
                context.player1.clickCard(context.mercenaryGunship);
                expect(context.mercenaryGunship).toBeInZone('spaceArena', context.player1);
                expect(context.player1.readyResourceCount).toBe(p1Resources - 4);

                context.player2.passAction();

                // Check that Player 1 can take control even if player 1 already has control
                context.player1.clickCard(context.mercenaryGunship);
                expect(context.player1).toHaveEnabledPromptButtons(['Attack', 'Take control of this unit']);
                context.player1.clickPrompt('Take control of this unit');
                expect(context.mercenaryGunship).toBeInZone('spaceArena', context.player1);
                expect(context.player1.readyResourceCount).toBe(p1Resources - 8);

                context.player2.passAction();

                // Check that Player 2 can take control even if the unit is exhausted
                context.player1.clickCard(context.mercenaryGunship);
                expect(context.player1).toHaveEnabledPromptButtons(['Attack', 'Take control of this unit']);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.mercenaryGunship);
                expect(context.mercenaryGunship).toBeInZone('spaceArena', context.player2);
                expect(context.player2.readyResourceCount).toBe(p1Resources - 8);
            });
        });
    });
});
