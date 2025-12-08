describe('Lando Calrissian, Eyes Open', function() {
    integration(function(contextRef) {
        describe('Lando Calrissian, Eyes Open\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['blood-sport', 'open-fire', 'torpedo-barrage', 'change-of-heart'],
                        groundArena: ['ground-assault-atat', 'consular-security-force'],
                        spaceArena: ['devastating-gunship']
                    },
                    player2: {
                        hand: ['daring-raid', 'covering-the-wing', 'power-of-the-dark-side'],
                        groundArena: ['resourceful-pursuers', 'cargo-juggernaut', 'lando-calrissian#eyes-open', 'val#loyal-to-the-end'],
                        spaceArena: ['munificent-frigate']
                    }
                });
            });

            it('should give -1/-0 to the attacker while Lando is defending', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.groundAssaultAtat);
                context.player1.clickCard(context.landoCalrissianEyesOpen);

                expect(context.landoCalrissianEyesOpen.damage).toBe(4);
                expect(context.groundAssaultAtat.damage).toBe(4);
            });

            it('should not give Lando or defender -1/-0 when he attacks', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.landoCalrissianEyesOpen);
                context.player2.clickCard(context.groundAssaultAtat);

                expect(context.groundAssaultAtat.damage).toBe(4);
                expect(context.landoCalrissianEyesOpen).toBeInZone('discard');
            });

            it('should not give -1/-0 to the attacker while attacking one of Lando\'s friendly units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.devastatingGunship);
                context.player1.clickCard(context.munificentFrigate);

                expect(context.devastatingGunship.damage).toBe(4);
                expect(context.munificentFrigate.damage).toBe(3);
            });
        });
    });
});