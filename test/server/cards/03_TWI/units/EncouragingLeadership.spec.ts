describe('EncouragingLeadership', function () {
    integration(function (contextRef) {
        describe('EncouragingLeadership\'s ability', function () {
            it('Gives +1/+1 for this phase to allies', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['encouraging-leadership'],
                        spaceArena: ['green-squadron-awing'],
                        groundArena: ['duchesss-champion', 'atst']
                    },
                    player2: {
                        spaceArena: ['star-wing-scout'],
                        groundArena: ['specforce-soldier'],
                    },
                });
                const { context } = contextRef;

                // Check if effect is applied to both units
                context.player1.clickCard(context.encouragingLeadership);
                expect(context.encouragingLeadership).toBeInZone('discard');
                expect(context.atst.getPower()).toEqual(7);
                expect(context.atst.getHp()).toEqual(8);
                expect(context.greenSquadronAwing.getPower()).toEqual(2);

                // Pass the phase
                context.player2.passAction();
                context.player1.passAction();
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                // Check if units power/hp is back to normal
                expect(context.greenSquadronAwing.getPower()).toEqual(1);
                expect(context.atst.getPower()).toEqual(6);
                expect(context.atst.getHp()).toEqual(7);
                expect(context.greenSquadronAwing.getPower()).toEqual(1);
            });
        });
    });
});