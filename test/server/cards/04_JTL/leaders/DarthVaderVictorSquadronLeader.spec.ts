describe('Darth Vader Victor Squadron Leader', function() {
    integration(function(contextRef) {
        describe('Darth Vader\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#victor-squadron-leader',
                        groundArena: ['atst']
                    },
                });
            });

            it('Should exhaust and creates a TIE fighter token if attacked with a non token Vehicle unit this phase', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();
                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('Create a TIE Fighter Token');
                expect(context.darthVader.exhausted).toBe(true);
                const tieFighters = context.player1.findCardsByName('tie-fighter');
                expect(tieFighters.length).toBe(1);
                expect(tieFighters).toAllBeInZone('spaceArena');
                expect(tieFighters.every((tie) => tie.exhausted)).toBeTrue();

                context.player2.passAction();
                context.moveToNextActionPhase();

                context.player1.clickCard(tieFighters[0]);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();
                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('Create a TIE Fighter Token');
                context.player1.clickPrompt('Use it anyway');
                expect(context.darthVader.exhausted).toBe(true);
                const tieFightersnew = context.player1.findCardsByName('tie-fighter');
                expect(tieFightersnew.length).toBe(1);
                expect(tieFightersnew).toAllBeInZone('spaceArena');
                expect(tieFightersnew.every((tie) => tie.exhausted)).toBeTrue();
            });

            it('Should on deploy as an upgrade and create two TIE fighter tokes', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('Deploy Darth Vader as a Pilot');
                context.player1.clickCard(context.atst);
                const tieFightersnew = context.player1.findCardsByName('tie-fighter');
                expect(tieFightersnew.length).toBe(2);
                expect(tieFightersnew).toAllBeInZone('spaceArena');
                expect(tieFightersnew.every((tie) => tie.exhausted)).toBeTrue();
            });

            it('Should deploy as a unit and NOT create Tie Fighter tokens', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('Deploy Darth Vader');
                const tieFightersnew = context.player1.findCardsByName('tie-fighter');
                expect(tieFightersnew.length).toBe(0);
            });
        });
    });
});