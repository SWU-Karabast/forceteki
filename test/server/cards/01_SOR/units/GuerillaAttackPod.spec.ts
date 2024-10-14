describe('Guerilla Attack Pod', function () {
    integration(function () {
        describe('Guerilla Attack Pod\'s ability', function () {
            const { context } = contextRef;

            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['guerilla-attack-pod'],
                        groundArena: ['battlefield-marine'],
                        base: { card: 'echo-base', damage: 14 }
                    },
                    player2: {
                        groundArena: ['rugged-survivors'],
                        base: { card: 'echo-base', damage: 14 }
                    }
                });
            });

            it('should not be ready if no base have more than 15 damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.guerillaAttackPod);
                expect(context.guerillaAttackPod.exhausted).toBeTrue();
            });

            it('should be ready if p2 base have more than 15 damage', function () {
                const { context } = contextRef;

                // attack with battlefield marine to trigger guerilla attack pod
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(17);
                context.player2.passAction();
                context.player1.clickCard(context.guerillaAttackPod);
                expect(context.guerillaAttackPod.exhausted).toBeFalse();
            });

            it('should be ready if p1 base have more than 15 damage', function () {
                const { context } = contextRef;

                // attack with rugged survivors to trigger guerilla attack pod
                context.player1.passAction();
                context.player2.clickCard(context.ruggedSurvivors);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(17);
                context.player1.clickCard(context.guerillaAttackPod);
                expect(context.guerillaAttackPod.exhausted).toBeFalse();
            });

            // TODO: when gain ambush is working, add test with  ECL to confirm that ambush > ready > attack sequence works right
        });
    });
});
