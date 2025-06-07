describe('Axe Woves, Accomplished Warrior', function() {
    integration(function(contextRef) {
        describe('Axe Woves\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        hand: ['hotshot-dl44-blaster', 'axe-woves#accomplished-warrior'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst'],
                        hand: ['top-target', 'perilous-position']
                    }
                });
            });

            it('should give +1/+1 for each upgrade on it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.axeWoves);

                // +1/+1 from ability
                expect(context.axeWoves.getPower()).toBe(3);
                expect(context.axeWoves.getHp()).toBe(3);

                context.player2.passAction();

                // Scenario 1 - We play an additional upgrade on axe woves he gets +2/+0 from upgrade and +1/+1
                // from ability
                context.player1.clickCard(context.hotshotDl44Blaster);
                context.player1.clickCard(context.axeWoves);

                // calculation +2/+0 from hotshot and +2/+2 from ability
                expect(context.axeWoves.getPower()).toBe(6);
                expect(context.axeWoves.getHp()).toBe(4);

                // Scenario 2 - Opponent playes bounty on axe woves giving him +1/+1 from ability
                // calculation +2/+0 from hotshot and +3/+3 from ability
                context.player2.clickCard(context.topTarget);
                context.player2.clickCard(context.axeWoves);
                expect(context.axeWoves.getPower()).toBe(7);
                expect(context.axeWoves.getHp()).toBe(5);

                // Scenario 3 - opponent plays perilous position -2/-2
                expect(context.player1).toBeActivePlayer();
                context.player1.passAction();

                context.player2.clickCard(context.perilousPosition);
                context.player2.clickCard(context.axeWoves);

                // calculation +2/0 from hotshot, +4/+4 from ability -2/-2 from perilous
                expect(context.axeWoves.getPower()).toBe(6);
                expect(context.axeWoves.getHp()).toBe(4);

                // Scenario 4 - Opponent attacks defeats a shield lowering power and hp by -1/-1
                context.player1.passAction();
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.axeWoves);

                // calculation +2/0 from hotshot, +3/+3 from ability -2/-2 from perilous
                expect(context.axeWoves.getPower()).toBe(5);
                expect(context.axeWoves.getHp()).toBe(3);
            });
        });
    });
});
