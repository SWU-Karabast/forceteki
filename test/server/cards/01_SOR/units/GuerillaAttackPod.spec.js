describe('Guerilla Attack Pod', function () {
    integration(function () {
        describe('Guerilla Attack Pod\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
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
                this.player1.clickCard(this.guerillaAttackPod);
                expect(this.guerillaAttackPod.exhausted).toBeTrue();
            });

            it('should be ready if p2 base have more than 15 damage', function () {
                // attack with battlefield marine to trigger guerilla attack pod
                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.p2Base);
                expect(this.p2Base.damage).toBe(17);
                this.player2.pass();
                this.player1.clickCard(this.guerillaAttackPod);
                expect(this.guerillaAttackPod.exhausted).toBeFalse();
            });

            it('should be ready if p1 base have more than 15 damage', function () {
                // attack with rugged survivors to trigger guerilla attack pod
                this.player1.pass();
                this.player2.clickCard(this.ruggedSurvivors);
                this.player2.clickCard(this.p1Base);
                expect(this.p1Base.damage).toBe(17);
                this.player1.clickCard(this.guerillaAttackPod);
                expect(this.guerillaAttackPod.exhausted).toBeFalse();
            });

            // TODO: when gain ambush is working, add test with  ECL to confirm that ambush > ready > attack sequence works right
        });
    });
});
