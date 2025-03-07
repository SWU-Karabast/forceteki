describe('Covering The Wing', function() {
    integration(function(contextRef) {
        describe('Covering The Wing\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['covering-the-wing'],
                        groundArena: ['wampa'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['red-three#unstoppable']
                    }
                });
            });

            it('should create a X-wing token unit and give a shield token to another unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.coveringTheWing);

                // Create an X-Wing token and assert it is exhausted
                const xwings = context.player1.findCardsByName('xwing');
                expect(xwings.length).toBe(1);
                expect(xwings).toAllBeInZone('spaceArena');
                expect(xwings.every((token) => token.exhausted)).toBeTrue();

                // Give a Shield token to another unit
                expect(context.player1).toHavePrompt('Give a Shield token to another unit');
                expect(context.player1).toHaveChooseNoTargetButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.redThree, context.allianceXwing]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            });
        });
    });
});
