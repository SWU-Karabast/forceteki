describe('A Fine Addition', function () {
    integration(function (contextRef) {
        it('A Fine Addition\'s ability should play an upgrade from your hand or opponents discard, ignoring aspect penalty, if an enemy was defeated this phase', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['a-fine-addition', 'ahsokas-padawan-lightsaber'],
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    groundArena: ['battlefield-marine'],
                    discard: ['lukes-lightsaber']
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
            expect(context.player1).toBeAbleToSelectExactly([context.jediLightsaber, context.lukesLightsaber, context.ahsokasPadawanLightsaber]);
            context.player1.clickCard(context.jediLightsaber);


            // Select attachment target
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.upgrades).toContain(context.jediLightsaber);
            expect(context.player1.exhaustedResourceCount).toBe(3); // no aspect penalty applied
        });
    });
});
