describe('Petition The Senate', function () {
    integration(function (contextRef) {
        describe('Petition The Senate\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['petition-the-senate'],
                        groundArena: ['general-tagge#concerned-commander',
                            'the-client#dictated-by-discretion',
                            'colonel-yularen#isb-director']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('If control 3 Official units, draw 3 cards', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.petitionTheSenate);
                expect(context.player1.hand.length).toBe(3);
            });
        });
    });
});
