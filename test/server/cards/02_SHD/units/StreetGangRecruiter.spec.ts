describe('Street Gang Recruiter', function () {
    integration(function (contextRef) {
        describe('Street Gang Recruiter\'s ability', function() {
            it('should return an Underworld card to player hand from his discard pile', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['street-gang-recruiter'],
                        groundArena: ['greedo#slow-on-the-draw'],
                        discard: ['ruthless-raider', 'ma-klounkee', 'bossk#deadly-stalker', 'hotshot-dl44-blaster']
                    },
                    player2: {
                        groundArena: ['luke-skywalker#jedi-knight'],
                        discard: ['lukes-lightsaber', 'maz-kanata#pirate-queen']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.streetGangRecruiter);
                expect(context.player1).toBeAbleToSelectExactly([context.maKlounkee, context.bosskDeadlyStalker]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.bosskDeadlyStalker);
                expect(context.player1.hand.length).toBe(1);
                expect(context.bosskDeadlyStalker.zoneName).toBe('hand');
            });

            it('should not do anything if no Underworld card is in the discard pile', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['street-gang-recruiter'],
                        groundArena: ['greedo#slow-on-the-draw'],
                        discard: ['ruthless-raider', 'hotshot-dl44-blaster']
                    },
                    player2: {
                        groundArena: ['luke-skywalker#jedi-knight'],
                        discard: ['lukes-lightsaber', 'maz-kanata#pirate-queen']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.streetGangRecruiter);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});