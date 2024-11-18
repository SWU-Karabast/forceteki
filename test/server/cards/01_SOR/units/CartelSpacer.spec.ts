describe('Cartel Spacer', function () {
    integration(function (contextRef) {
        describe('Cartel Spacer\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['atst', 'battlefield-marine', 'partisan-insurgent'],
                    }
                });
            });

            it('should not exhaust enemy unit if there is no Cunning ally', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer.zoneName).toBe('spaceArena');
                expect(context.player2).toBeActivePlayer();

                expect(context.atst.exhausted).toBeFalse();
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.partisanInsurgent.exhausted).toBeFalse();
            });
        });

        describe('Cartel Spacer\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cartel-spacer'],
                        groundArena: ['gamorrean-guards'],
                    },
                    player2: {
                        groundArena: ['atst', 'battlefield-marine', 'partisan-insurgent'],
                    }
                });
            });

            it('should exhaust enemy unit when there is Cunning ally', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.cartelSpacer);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.partisanInsurgent]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();

                expect(context.atst.exhausted).toBeFalse();
                expect(context.partisanInsurgent.exhausted).toBeFalse();
                expect(context.battlefieldMarine.exhausted).toBeTrue();
            });
        });
    });
});
