describe('Bo-KatanKryze', function () {
    integration(function (contextRef) {
        describe('Bo-KatanKryze on defeated ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['bokatan-kryze#fighting-for-mandalore'],
                        base: { card: 'echo-base', damage: 12 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        hand: ['repair'],
                        base: { card: 'echo-base', damage: 12 }
                    }
                });
            });

            it('Correct card draw depending on base(s) damage', function() {
                const { context } = contextRef;

                const reset = () => {
                    context.player1.moveCard(context.bokatanKryze, 'groundArena');
                    context.player2.moveCard(context.battlefieldMarine, 'groundArena');
                    context.bokatanKryze.exhausted = false;
                    context.battlefieldMarine.exhausted = false;
                };

                // case 1: No cards drawn if damage on both bases is less than 15
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.battlefieldMarine);
                // nothing in hand
                expect(context.player1.hand.length).toBe(0);
                context.player2.passAction();

                reset();

                // case 2: 1 card drawn if damage on opponents base is equal to 15 and own base is less than 15
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(15);
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.bokatanKryze);
                // draws a card
                expect(context.player1.hand.length).toBe(1);

                reset();

                // case 3: 2 cards drawn if damage on both bases exceeds 15
                context.player1.passAction();
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.battlefieldMarine);
                // draws 2 cards
                expect(context.player1.hand.length).toBe(3);

                reset();

                // case 4: 1 card drawn, if damage on own base exceeds 15 and opponents base is less than 15
                context.player2.clickCard(context.repair);
                context.player2.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(12);
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.battlefieldMarine);
                // draws 1 card
                expect(context.player1.hand.length).toBe(4);
            });
        });
    });
});