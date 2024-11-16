describe('Millennium Falcon', function() {
    integration(function(contextRef) {
        describe('Millennium Falcon\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['millennium-falcon#landos-pride']
                    },
                    player2: {
                        spaceArena: ['bright-hope#the-last-transport'],
                    }
                });
            });

            it('should have Ambush if played from hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.millenniumFalcon);
                expect(context.player1).toHaveExactPromptButtons(['Ambush', 'Pass']);
                context.player1.clickPrompt('Ambush');
                expect(context.millenniumFalcon.exhausted).toBeTrue();
                expect(context.millenniumFalcon.damage).toBe(2);
                expect(context.brightHope.damage).toBe(5);
            });
        });

        /* describe('Escort Skiff\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['escort-skiff'],
                    },
                    player2: {
                        groundArena: ['grogu#irresistible'],
                    }
                });
            });

            it('should not have Ambush while we are not controlling a Command unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.escortSkiff);
                expect(context.player2).toBeActivePlayer();
            });
        });*/
    });
});
