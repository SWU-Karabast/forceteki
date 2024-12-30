describe('Echo Valiant Arc Trooper', function() {
    integration(function(contextRef) {
        it('Echo\'s constant Coordinate ability should gain +2/+2', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['echo#valiant-arc-trooper'],
                    spaceArena: ['wing-leader'],
                    hand: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['hylobon-enforcer'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;
            expect(context.echo.getPower()).toBe(2);
            expect(context.echo.getHp()).toBe(2);

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.echo.getPower()).toBe(4);
            expect(context.echo.getHp()).toBe(4);

            context.player2.clickCard(context.cartelSpacer);
            context.player2.clickCard(context.wingLeader);
            expect(context.echo.getPower()).toBe(2);
            expect(context.echo.getHp()).toBe(2);
        });
    });
});