describe('A Fine Addition', function () {
    integration(function (contextRef) {
        it('A Fine Addition\'s ability should play an upgrade from your hand or opponents discard, ignoring aspect penalty, if an enemy was defeated this phase', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['a-fine-addition'],
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa', 'criminal-muscle'],
                    discard: ['jedi-lightsaber']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.criminalMuscle);

            expect(context.criminalMuscle).toBeInZone('discard');

            context.player2.passAction();

            context.player1.clickCard(context.aFineAddition);

            // Select upgrade from opponents discard
            context.player1.clickCard(context.jediLightsaber);

            // Select attachment target
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1.exhaustedResourceCount).toBe(3); // no aspect penalty applied
        });
    });
});
