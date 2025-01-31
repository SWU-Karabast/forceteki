describe('Inspiring Mentor', function() {
    integration(function(contextRef) {
        it('Inspiring Mentor ability should give the attached unit an on attack and when defeated ability to give an experience token to another friendly unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['inspiring-mentor'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['headhunter-squadron']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Player 1 attaches Inspiring Mentor to a non-vehicle unit
            context.player1.clickCard(context.inspiringMentor);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);

            context.player1.clickCard(context.battlefieldMarine);

            // Player 2 passes
            context.player2.passAction();

            // Player 1 triggers the on attack ability from Inspiring Mentor
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.headhunterSquadron]);
            context.player1.clickCard(context.headhunterSquadron);
            expect(context.headhunterSquadron).toHaveExactUpgradeNames(['experience']);

            // Player 2 defeats the Battlefield Marine
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.battlefieldMarine);

            // Player 1 resolves the on defeated ability from Inspiring Mentor
            expect(context.player1).toBeAbleToSelectExactly([context.headhunterSquadron]);
            context.player1.clickCard(context.headhunterSquadron);
            expect(context.headhunterSquadron).toHaveExactUpgradeNames(['experience', 'experience']);

            expect(context.player1).toBeActivePlayer();
        });
    });
});
