describe('Fennec Shand, Loyal Sharpshooter', function () {
    integration(function (contextRef) {
        describe('Fennec Shand\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['fennec-shand#loyal-sharpshooter'],
                        discard: ['battlefield-marine', 'jedha-agitator', 'echo-base-defender']
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });
            });

            it('should deal 1 damage to the defender (if it\'s a unit) for each different cost among cards in your discard pile', function () {
                const { context } = contextRef;

                // attack base, no extra damage
                context.player1.clickCard(context.fennecShand);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);

                context.fennecShand.exhausted = false;
                context.player2.passAction();

                // attack unit, should have 2 extra damage
                context.player1.clickCard(context.fennecShand);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player2).toBeActivePlayer();
                expect(context.consularSecurityForce.damage).toBe(6);
            });
        });

        describe('Fennec Shand\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['fennec-shand#loyal-sharpshooter'],
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });
            });

            it('should deal 1 damage to the defender (if it\'s a unit) for each different cost among cards in your discard pile (with an empty discard)', function () {
                const { context } = contextRef;

                // attack base, no extra damage
                context.player1.clickCard(context.fennecShand);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);

                context.fennecShand.exhausted = false;
                context.player2.passAction();

                // attack unit, should have 0 extra damage
                context.player1.clickCard(context.fennecShand);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player2).toBeActivePlayer();
                expect(context.consularSecurityForce.damage).toBe(4);
            });
        });
    });
});
