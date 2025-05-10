describe('Darth Revan\'s Lightsabers', function() {
    integration(function(contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['atst', 'battlefield-marine', 'knight-of-the-republic'],
                    hand: ['darth-revans-lightsabers'],
                },
                player2: {
                    groundArena: ['specforce-soldier'],
                }
            });
        });

        it('gives Grit to attached unit if it is a Force unit', function() {
            const { context } = contextRef;

            expect(context.knightOfTheRepublic.hasSomeKeyword('grit')).toBeFalse();

            context.player1.clickCard(context.darthRevansLightsabers);
            expect(context.player1).toBeAbleToSelectExactly([context.knightOfTheRepublic, context.battlefieldMarine, context.specforceSoldier]);

            context.player1.clickCard(context.knightOfTheRepublic);
            expect(context.knightOfTheRepublic.hasSomeKeyword('grit')).toBeTrue();
        });

        it('does nothing if not attached to a Force unit', function() {
            const { context } = contextRef;

            expect(context.battlefieldMarine.hasSomeKeyword('grit')).toBeFalse();

            context.player1.clickCard(context.darthRevansLightsabers);
            expect(context.player1).toBeAbleToSelectExactly([context.knightOfTheRepublic, context.battlefieldMarine, context.specforceSoldier]);

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine.hasSomeKeyword('grit')).toBeFalse();
        });
    });
});