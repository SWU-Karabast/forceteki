describe('Darth Revan\'s Lightsabers', function() {
    integration(function(contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['atst', 'sith-legionnaire', 'knight-of-the-republic'],
                    hand: ['darth-revans-lightsabers'],
                },
                player2: {
                    groundArena: ['specforce-soldier'],
                }
            });
        });

        it('gives Grit to attached unit if it is a Sith unit', function() {
            const { context } = contextRef;

            expect(context.sithLegionnaire.hasSomeKeyword('grit')).toBeFalse();

            context.player1.clickCard(context.darthRevansLightsabers);
            expect(context.player1).toBeAbleToSelectExactly([context.knightOfTheRepublic, context.sithLegionnaire, context.specforceSoldier]);

            context.player1.clickCard(context.sithLegionnaire);
            expect(context.sithLegionnaire.hasSomeKeyword('grit')).toBeTrue();
        });

        it('does nothing if not attached to a Sith unit', function() {
            const { context } = contextRef;

            expect(context.knightOfTheRepublic.hasSomeKeyword('grit')).toBeFalse();

            context.player1.clickCard(context.darthRevansLightsabers);
            expect(context.player1).toBeAbleToSelectExactly([context.knightOfTheRepublic, context.sithLegionnaire, context.specforceSoldier]);

            context.player1.clickCard(context.knightOfTheRepublic);
            expect(context.knightOfTheRepublic.hasSomeKeyword('grit')).toBeFalse();
        });
    });
});