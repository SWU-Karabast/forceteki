describe('Seventh Sister', function () {
    integration(function (contextRef) {
        describe('Seventh Sister\'s triggered ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'seventh-sister#implacable-inquisitor']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                        base: 'chopper-base'
                    },
                });
            });

            it('may deal 3 damage to a ground unit if attacked base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.seventhSisterImplacableInquisitor);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.bobaFettDaimyo, context.chopperBase]);
                context.player1.clickCard(context.chopperBase);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.bobaFettDaimyo]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(3);
            });

            it('may not deal 3 damage if attacked unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.seventhSisterImplacableInquisitor);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.bobaFettDaimyo, context.chopperBase]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
