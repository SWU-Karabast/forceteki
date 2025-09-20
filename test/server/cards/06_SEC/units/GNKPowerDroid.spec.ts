describe('GNK Power Droid', function () {
    integration(function (contextRef) {
        describe('GNK Power Droid\'s on attack ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['gnk-power-droid'],
                        hand: ['battlefield-marine', 'phoenix-squadron-awing'],
                        leader: 'leia-organa#alliance-general'
                    },
                    player2: {
                        hand: ['wampa'],
                        base: 'tarkintown'
                    }
                });
            });

            it('should discount the next unit you play this phase by 1 resource', function () {
                const { context } = contextRef;

                // Attack with GNK Power Droid to trigger the effect
                context.player1.clickCard(context.gnkPowerDroid);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.wampa);
                expect(context.player2.exhaustedResourceCount).toBe(4);

                // Now, the next unit P1 plays this phase costs 1 less
                const lastExhaustedResources = context.player1.exhaustedResourceCount;

                // Battlefield Marine costs 2, should cost 1 after discount
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(lastExhaustedResources + 1);

                // A second unit in the same phase should not be discounted further
                context.player2.passAction();
                const lastExhaustedResources2 = context.player1.exhaustedResourceCount;
                context.player1.clickCard(context.phoenixSquadronAwing); // cost 2 normally
                expect(context.player1.exhaustedResourceCount).toBe(lastExhaustedResources2 + 2);
            });

            it('should end at the end of phase', function () {
                const { context } = contextRef;

                // Attack with GNK Power Droid to trigger the effect
                context.player1.clickCard(context.gnkPowerDroid);
                context.player1.clickCard(context.p2Base);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });
        });
    });
});
