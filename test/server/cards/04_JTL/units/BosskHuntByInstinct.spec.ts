describe('Bossk, Hunt By Instinct', function () {
    integration(function (contextRef) {
        describe('Bossk\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['bossk#hunt-by-instinct'],
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                    }
                });
            });

            it('should does nothing because target is not a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);
            });

            it('should exhaust the target and deal 1 damage to it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player2).toBeActivePlayer();
                expect(context.consularSecurityForce.damage).toBe(5);
                expect(context.consularSecurityForce.exhausted).toBeTrue();
            });
        });

        describe('Bossk\'s piloting ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bossk#hunt-by-instinct'],
                        groundArena: ['stolen-landspeeder']
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                    }
                },
                (context) => {
                    context.player1.clickCard(context.bossk);
                    context.player1.clickPrompt('Play Bossk with Piloting');
                    context.player1.clickCard(context.stolenLandspeeder);

                    context.player2.passAction();
                });
            });

            it('should does nothing because target is not a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.stolenLandspeeder);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(5);
            });

            it('should exhaust the target and deal 1 damage to it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.stolenLandspeeder);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player2).toBeActivePlayer();
                expect(context.consularSecurityForce.damage).toBe(6);
                expect(context.consularSecurityForce.exhausted).toBeTrue();
            });
        });
    });
});
