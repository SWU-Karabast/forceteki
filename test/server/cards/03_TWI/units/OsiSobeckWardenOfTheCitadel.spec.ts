describe('Osi Sobeck, Warden of the Citadel', function () {
    integration(function (contextRef) {
        it('Osi Sobeck\'s ability should capture an enemy ground unit which cost equal or less than resources paid to play him', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['osi-sobeck#warden-of-the-citadel', 'palpatines-return'],
                    groundArena: ['battlefield-marine'],
                    resources: 25
                },
                player2: {
                    groundArena: ['scout-bike-pursuer', 'wampa', 'atst', 'gor#grievouss-pet'],
                    spaceArena: ['green-squadron-awing']
                },
            });

            const { context } = contextRef;

            // play osi sobeck using 6 resources
            context.player1.clickCard(context.osiSobeck);
            context.player1.clickPrompt('Play Osi Sobeck');

            // can capture any enemy ground unit which cost 6 or less
            expect(context.player1).toBeAbleToSelectExactly([context.scoutBikePursuer, context.wampa, context.atst]);

            context.player1.clickCard(context.atst);
            expect(context.atst).toBeCapturedBy(context.osiSobeck);

            context.player1.moveCard(context.osiSobeck, 'hand');
            context.player2.moveCard(context.atst, 'groundArena');

            context.player2.passAction();

            // play osi sobeck using 4 resources and exploit 1
            context.player1.clickCard(context.osiSobeck);
            context.player1.clickPrompt('Play Osi Sobeck using Exploit');

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickPrompt('Done');

            // can capture any enemy ground unit which cost 4 or less
            expect(context.player1).toBeAbleToSelectExactly([context.scoutBikePursuer, context.wampa]);

            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeCapturedBy(context.osiSobeck);

            context.player1.moveCard(context.osiSobeck, 'discard');
            context.player2.moveCard(context.wampa, 'groundArena');

            context.player2.passAction();

            // play osi sobeck free with palpatine's return
            context.player1.clickCard(context.palpatinesReturn);
            context.player1.clickCard(context.osiSobeck);

            // cannot capture anybody
            expect(context.player2).toBeActivePlayer();
        });
    });
});
