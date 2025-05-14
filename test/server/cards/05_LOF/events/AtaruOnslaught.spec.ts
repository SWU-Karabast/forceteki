describe('Ataru Onslaught', function () {
    integration(function (contextRef) {
        describe('Ataru Onslaught\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ataru-onslaught'],
                        groundArena: ['yoda#old-master', 'wampa', 'mace-windu#party-crasher'],
                    },
                    player2: {
                        groundArena: ['savage-opress#monster', 'seventh-sister#implacable-inquisitor'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            it('should ready a Force unit with 4 or less power', function () {
                const { context } = contextRef;

                context.exhaustCard(context.yoda);
                context.exhaustCard(context.maceWindu);
                context.exhaustCard(context.savageOpress);
                context.exhaustCard(context.seventhSister);

                // Ready yoda (Savage and Mace have more than 4 power so they are not selectable)
                context.player1.clickCard(context.ataruOnslaught);
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.seventhSister]);
                context.player1.clickCard(context.yoda);
                expect(context.yoda.exhausted).toBeFalse();
                expect(context.ataruOnslaught.zoneName).toBe('discard');
            });

            it('should skip target selection if there are no exhausted targets', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ataruOnslaught);
                expect(context.ataruOnslaught.zoneName).toBe('discard');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
