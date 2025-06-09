describe('Acclamator Assault Ship', function() {
    integration(function(contextRef) {
        describe('Acclamator Assault Ship\'s on attack ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['acclamator-assault-ship'],
                        groundArena: ['wampa'],
                        leader: { card: 'asajj-ventress#unparalleled-adversary', deployed: true },
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                    },
                });
            });

            it('should give +5/+5 to another unit for this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.acclamatorAssaultShip);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePrompt('Give another unit +5/+5 for this phase');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.battlefieldMarine, context.asajjVentress]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa.getPower()).toBe(9);
                expect(context.wampa.getHp()).toBe(10);

                context.moveToRegroupPhase();

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
            });
        });
    });
});