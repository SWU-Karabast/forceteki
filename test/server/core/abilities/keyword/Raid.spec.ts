describe('Raid keyword', function() {
    integration(function(contextRef) {
        describe('When a unit with the Raid keyword', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['cantina-braggart'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });
            });

            it('attacks, power should be increased by raid amount', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.cantinaBraggart);
                context.player1.clickCard(context.p2Base);
                expect(context.cantinaBraggart.exhausted).toBe(true);
                expect(context.cantinaBraggart.getPower()).toBe(0);
                expect(context.p2Base.damage).toBe(2);

                context.cantinaBraggart.exhausted = false;
                context.player2.passAction();

                context.player1.clickCard(context.cantinaBraggart);
                context.player1.clickCard(context.p2Base);
                expect(context.cantinaBraggart.getPower()).toBe(0);
                expect(context.p2Base.damage).toBe(4);
            });

            it('defends, power should not be increased by raid amount', function () {
                const { context } = contextRef;

                context.player2.setActivePlayer();
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.cantinaBraggart);

                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.cantinaBraggart).toBeInLocation('discard');
            });
        });

        // TODO Test that Red Three raid buff stacks and is then removed when Red Three is out of play
        // describe('When a unit with the Raid keyword and a gained Raid ability', function() {
        //     beforeEach(function () {
        //         contextRef.setupTest({
        //             phase: 'action',
        //             player1: {
        //                 groundArena: ['cantina-braggart'],
        //             },
        //             player2: {
        //                 groundArena: ['battlefield-marine'],
        //             }
        //         });
        //         context.cantinaBraggart = context.player1.findCardByName('cantina-braggart');
        //         context.battlefieldMarine = context.player2.findCardByName('battlefield-marine');

        //         context.p1Base = context.player1.base;
        //         context.p2Base = context.player2.base;
        //     });

        //     it('attacks, base should have the cumulative raid amount', function () {
        const { context } = contextRef;

        //     });
        // });

        // TODO test that a card that attacked and then is bounced back to hand (i.e. Waylay) doesn't receive a second Raid buff
    });
});
