describe('Bo-KatanKryze', function () {
    integration(function (contextRef) {
        describe('Bo-KatanKryze on defeated ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['bokatan-kryze#fighting-for-mandalore'],
                        base: { card: 'echo-base', damage: 12 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        base: { card: 'echo-base', damage: 12 }
                    }
                });
            });

            it('No cards drawn if damage on both bases is less than 15', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.bokatanKryze).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');

                expect(context.player1.hand.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('1 card drawn, if damage on opponents base is equal to 15 and own base is less than 15', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(15);

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.bokatanKryze);
                expect(context.player1.hand.length).toBe(1);
            });

            it(' 2 cards drawn if damage on both bases exceeds 15', function () {
                const { context } = contextRef;
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['bokatan-kryze#fighting-for-mandalore'],
                        base: { card: 'echo-base', damage: 17 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        base: { card: 'echo-base', damage: 21 }
                    }
                });

                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.hand.length).toBe(2);
            });

            it('1 card drawn, if damage on own base exceeds 15 and opponents base is less than 15', function () {
                const { context } = contextRef;
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['bokatan-kryze#fighting-for-mandalore'],
                        base: { card: 'echo-base', damage: 17 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        base: { card: 'echo-base', damage: 6 }
                    }
                });

                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.hand.length).toBe(1);
            });
        });
    });
});