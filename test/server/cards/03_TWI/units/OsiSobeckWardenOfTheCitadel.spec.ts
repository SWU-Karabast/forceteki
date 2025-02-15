describe('Osi Sobeck, Warden of the Citadel', function () {
    integration(function (contextRef) {
        it('Osi Sobeck\'s ability should capture an enemy ground unit which cost equal or less than resources paid to play him', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['osi-sobeck#warden-of-the-citadel', 'palpatines-return'],
                    groundArena: ['battlefield-marine'],
                    resources: 25,
                    leader: 'hondo-ohnaka#thats-good-business'
                },
                player2: {
                    hand: ['drop-in'],
                    groundArena: ['scout-bike-pursuer', 'wampa', 'atst', 'maul#shadow-collective-visionary', 'rugged-survivors', 'yoda#old-master', 'bail-organa#rebel-councilor'],
                    spaceArena: ['green-squadron-awing']
                },
            });

            const { context } = contextRef;

            // play osi sobeck using 6 resources
            context.player1.clickCard(context.osiSobeck);
            context.player1.clickPrompt('Play Osi Sobeck');

            // can capture any enemy ground unit which cost 6 or less
            expect(context.player1).toBeAbleToSelectExactly([context.bailOrgana, context.scoutBikePursuer, context.yoda, context.wampa, context.ruggedSurvivors, context.atst]);

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
            expect(context.player1).toBeAbleToSelectExactly([context.bailOrgana, context.scoutBikePursuer, context.yoda, context.wampa]);

            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeCapturedBy(context.osiSobeck);

            context.player1.moveCard(context.osiSobeck, 'discard');
            context.player2.moveCard(context.wampa, 'groundArena');

            context.player2.clickCard(context.dropIn);

            // play osi sobeck free with palpatine's return
            context.player1.clickCard(context.palpatinesReturn);
            context.player1.clickCard(context.osiSobeck);

            const troopers = context.player2.findCardsByName('clone-trooper');

            // can capture 0 cost unit
            expect(context.player1).toBeAbleToSelectExactly(troopers);
            context.player1.clickCard(troopers[0]);
        });
    });
});
