describe('Inspiring Mentor', function() {
    integration(function(contextRef) {
        describe('when attached to a friendly unit', function() {
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
            });
        });

        describe('when attached to a friendly unit and the opponent takes control of it', function() {
            it('Inspiring Mentor ability should give the attached unit an on attack and when defeated ability to give an experience token to another friendly unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['inspiring-mentor'],
                        groundArena: ['battlefield-marine', 'atst']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['change-of-heart']
                    }
                });

                const { context } = contextRef;

                // Player 1 attaches Inspiring Mentor to a non-vehicle unit
                context.player1.clickCard(context.inspiringMentor);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);

                context.player1.clickCard(context.battlefieldMarine);

                // Player 2 plays Change of Heart to take control of the Battlefield Marine
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.battlefieldMarine);

                // Player 1 passes
                context.player1.passAction();

                // Player 2 triggers the on attack ability from Inspiring Mentor
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa]);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['experience']);

                // Player 1 defeats the Battlefield Marine triggering the on defeated ability from Inspiring Mentor
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa]);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['experience', 'experience']);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('when attached to a enemy unit', function() {
            it('Inspiring Mentor ability should give the attached unit an on attack and when defeated ability to give an experience token to another friendly unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['inspiring-mentor'],
                        groundArena: ['atst']
                    },
                    player2: {
                        groundArena: ['wampa', 'battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                // Player 1 attaches Inspiring Mentor to a non-vehicle unit
                context.player1.clickCard(context.inspiringMentor);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);

                context.player1.clickCard(context.battlefieldMarine);

                // Player 2 triggers the on attack ability from Inspiring Mentor
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa]);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['experience']);

                // Player 1 defeats the Battlefield Marine triggering the on defeated ability from Inspiring Mentor
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa]);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['experience', 'experience']);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
