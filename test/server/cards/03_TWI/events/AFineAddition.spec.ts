describe('A Fine Addition', function () {
    integration(function (contextRef) {
        it('A Fine Addition\'s ability should play an upgrade from your hand or opponents discard, ignoring aspect penalty, if an enemy was defeated this phase', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['a-fine-addition', 'ahsokas-padawan-lightsaber'],
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    groundArena: ['battlefield-marine', 'death-star-stormtrooper', 'snowspeeder'],
                    discard: ['lukes-lightsaber', 'specforce-soldier'],
                    base: 'dagobah-swamp' // blue aspect for fine addition
                },
                player2: {
                    hand: ['devotion', 'resilient'],
                    leader: { card: 'finn#this-is-a-rescue', deployed: true },
                    groundArena: ['wampa', 'criminal-muscle'],
                    discard: ['jedi-lightsaber', 'open-fire']
                }
            });

            const { context } = contextRef;

            // NO-OP play -- no enemy was defeated
            context.player1.clickCard(context.aFineAddition);
            expect(context.aFineAddition).toBeInZone('discard');

            expect(context.player2).toBeActivePlayer();

            // Restore for more testing
            context.player1.moveCard(context.aFineAddition, 'hand');

            // Now defeat an friendly unit to make sure it doesn't trigger opponent
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.deathStarStormtrooper);

            // should be another NO-OP play -- no enemy was defeated
            context.player1.clickCard(context.aFineAddition);
            expect(context.aFineAddition).toBeInZone('discard');

            expect(context.player2).toBeActivePlayer();

            // Restore for more testing
            context.player1.moveCard(context.aFineAddition, 'hand');

            context.player2.passAction();

            // Now defeat an enemy opponent
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.criminalMuscle);

            expect(context.criminalMuscle).toBeInZone('discard');

            // Add an upgrade to wampa for Finn's ability later
            context.player2.clickCard(context.resilient);
            context.player2.clickCard(context.wampa);

            context.player1.clickCard(context.aFineAddition);
            expect(context.player1.exhaustedResourceCount).toBe(0);

            // Select upgrade from opponents discard
            expect(context.player1).toBeAbleToSelectExactly([context.jediLightsaber, context.lukesLightsaber, context.ahsokasPadawanLightsaber]);
            context.player1.clickCard(context.jediLightsaber);

            // Select attachment target
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.finnThisIsARescue]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames([context.jediLightsaber.internalName]);
            expect(context.player1.exhaustedResourceCount).toBe(3); // no aspect penalty applied

            context.player2.clickCard(context.finnThisIsARescue);
            context.player2.clickCard(context.p1Base);

            expect(context.player2).toHavePrompt('Choose an upgrade');
            expect(context.player2).toBeAbleToSelectExactly([context.resilient]);

            context.player2.clickCard(context.resilient);

            // Restore for more testing
            context.player1.moveCard(context.aFineAddition, 'hand');

            context.player1.clickCard(context.aFineAddition);
            expect(context.player1.exhaustedResourceCount).toBe(3);

            // Test player1's discard pile
            expect(context.player1).toBeAbleToSelectExactly([context.lukesLightsaber, context.ahsokasPadawanLightsaber, context.resilient]);
            context.player1.clickCard(context.lukesLightsaber);

            // Select attachment target
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.finnThisIsARescue]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames([context.jediLightsaber.internalName, context.lukesLightsaber.internalName]);
            expect(context.player1.exhaustedResourceCount).toBe(5); // +2 for lukes lightsaber

            context.player2.passAction();

            // Restore for more testing
            context.player1.moveCard(context.aFineAddition, 'hand');

            context.player1.clickCard(context.aFineAddition);
            expect(context.player1.exhaustedResourceCount).toBe(5);

            // Test player1's hand
            expect(context.player1).toBeAbleToSelectExactly([context.ahsokasPadawanLightsaber, context.resilient]);
            context.player1.clickCard(context.ahsokasPadawanLightsaber);

            // Select attachment target
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.finnThisIsARescue]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames([context.jediLightsaber.internalName, context.lukesLightsaber.internalName, context.ahsokasPadawanLightsaber.internalName]);
            expect(context.player1.exhaustedResourceCount).toBe(6); // +1 for lukes lightsaber
        });
    });
});
