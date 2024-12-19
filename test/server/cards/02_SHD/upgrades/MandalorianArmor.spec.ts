describe('Mandalorian Armor', function() {
    integration(function(contextRef) {
        describe('Mandalorian Armor\'s attached ability', function() {
            it('If attached unit is a Mandalorian, give a Shield token to it, or dont', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['ketsu-onyo#old-friend', 'the-mandalorian#wherever-i-go-he-goes', 'battlefield-marine'],
                        hand: ['mandalorian-armor']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        hand: ['vanquish']
                    }
                });

                const { context } = contextRef;
                // test1: mando armor played on a mando trait unit.
                context.player1.clickCard(context.mandalorianArmor);
                expect(context.player1).toBeAbleToSelectExactly([context.ketsuOnyo, context.theMandalorian, context.battlefieldMarine, context.pykeSentinel]);
                context.player1.clickCard(context.theMandalorian);
                expect(context.theMandalorian).toHaveExactUpgradeNames(['shield', 'mandalorian-armor']);

                // remove unit and sent upgrade back to hand
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.theMandalorian);
                context.player1.moveCard(context.mandalorianArmor, 'hand');

                // test2: play mando armor on opponents unit, no shield should be given as not a mandalorian
                context.player1.clickCard(context.mandalorianArmor);
                expect(context.player1).toBeAbleToSelectExactly([context.ketsuOnyo, context.battlefieldMarine, context.pykeSentinel]);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toHaveExactUpgradeNames(['mandalorian-armor']);
            });
        });
    });
});
