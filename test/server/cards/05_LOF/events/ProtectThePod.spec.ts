describe('Protect The Pod', function() {
    integration(function(contextRef) {
        describe('Protect The Pod\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['protect-the-pod'],
                        groundArena: [{ card: 'wampa', upgrades: ['experience'] }, 'atst'],
                        spaceArena: [{ card: 'grappling-guardian', damage: 3 }]
                    },
                    player2: {
                        groundArena: ['the-zillo-beast#awoken-from-the-depths'],
                        spaceArena: ['devastator#inescapable']
                    }
                });
            });

            it('should allow a friendly non-Vehicle unit to deal damage equal to its remaining HP to an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.protectThePod);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.grapplingGuardian]);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.theZilloBeast, context.devastator]);
                context.player1.clickCard(context.devastator);

                expect(context.player2).toBeActivePlayer();
                expect(context.devastator.damage).toBe(6);
            });

            it('should allow a friendly non-Vehicle unit to deal damage equal to its remaining HP to an enemy unit (space unit without being a Vehicle unit)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.protectThePod);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.grapplingGuardian]);
                context.player1.clickCard(context.grapplingGuardian);
                expect(context.player1).toBeAbleToSelectExactly([context.theZilloBeast, context.devastator]);
                context.player1.clickCard(context.devastator);

                expect(context.player2).toBeActivePlayer();
                expect(context.devastator.damage).toBe(6);
            });
        });
    });
});