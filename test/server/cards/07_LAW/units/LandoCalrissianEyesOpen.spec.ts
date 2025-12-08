describe('Lando Calrissian, Eyes Open', function() {
    integration(function(contextRef) {
        describe('Lando Calrissian, Eyes Open\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['blood-sport', 'open-fire', 'torpedo-barrage', 'change-of-heart'],
                        groundArena: ['ground-assault-atat', 'consular-security-force', 'snowtrooper', 'moisture-farmer', 'house-kast-soldier'],
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

                // Mupltiple attacks
                context.player2.passAction();

                context.player1.clickCard(context.snowtrooper);
                context.player1.clickCard(context.landoCalrissianEyesOpen);

                expect(context.landoCalrissianEyesOpen.damage).toBe(4);

                // Attack from 0 power unit
                context.player2.passAction();

                context.player1.clickCard(context.moistureFarmer);
                context.player1.clickCard(context.landoCalrissianEyesOpen);

                expect(context.landoCalrissianEyesOpen.damage).toBe(4);
            });

            it('should not give -1/-0 when Lando\'s base is attacked', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.houseKastSoldier);
                context.player1.clickCard(context.player2.base);

                expect(context.player2.base.damage).toBe(2);
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