describe('No Good to Me Dead', function() {
    integration(function(contextRef) {
        describe('No Good to Me Dead\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['no-good-to-me-dead'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        hand: ['keep-fighting'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('should exhaust a unit and restrict it to be ready', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.noGoodToMeDead);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.greenSquadronAwing, context.sabineWren]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.greenSquadronAwing.exhausted).toBeFalse();
                expect(context.sabineWren.exhausted).toBeFalse();

                // play keep fighting on battlefield marine
                context.player2.clickCard(context.keepFighting);
                context.player2.clickCardNonChecking(context.battlefieldMarine);
                expect(context.battlefieldMarine.exhausted).toBeTrue();

                // battlefield marine should not be ready on regroup phase
                context.moveToNextActionPhase();
                expect(context.battlefieldMarine.exhausted).toBeTrue();
            });

            it('should exhaust attached unit and restrict it to be ready (until the end of round)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.noGoodToMeDead);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.greenSquadronAwing, context.sabineWren]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.exhausted).toBeTrue();

                // battlefield marine should not be ready on regroup phase
                context.moveToNextActionPhase();
                expect(context.battlefieldMarine.exhausted).toBeTrue();

                context.player1.passAction();
                // play keep fighting on battlefield marine
                context.player2.clickCard(context.keepFighting);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.exhausted).toBeFalse();
            });
        });
    });
});
