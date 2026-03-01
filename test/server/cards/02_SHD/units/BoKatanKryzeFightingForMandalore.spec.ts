describe('Bo-Katan Kryze, Fighting for Mandalore', function () {
    integration(function (contextRef) {
        describe('Bo-Katan Kryze on defeated ability', function () {
            it('Correct card draw depending on base(s) damage', async function() {
                await contextRef.setupTestAsync({
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

                const { context } = contextRef;

                const reset = () => {
                    context.player1.moveCard(context.bokatanKryze, 'groundArena');
                    context.player2.moveCard(context.battlefieldMarine, 'groundArena');
                    context.readyCard(context.bokatanKryze);
                    context.readyCard(context.battlefieldMarine);
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

            it('triggers LOF Rey if she is drawn from Bo-Katan\'s ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['bokatan-kryze#fighting-for-mandalore'],
                        base: { card: 'echo-base', damage: 15 },
                        deck: ['rey#with-palpatines-power', 'sorcerous-blast']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        base: { card: 'echo-base', damage: 15 }
                    }
                });

                const { context } = contextRef;

                // Attack with Bo-Katan to defeat her and draw Rey
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.battlefieldMarine);

                // Check that Rey was drawn
                expect(context.player1.hand.length).toBe(2);
                expect(context.rey).toBeInZone('hand', context.player1);

                // Ability triggers
                expect(context.player1).toHavePassAbilityPrompt('Reveal Rey to deal 2 damage to a unit and 2 damage to a base');
                context.player1.clickPrompt('Trigger');
                context.player2.clickDone(); // Dismiss the reveal prompt
                expect(context.player1).toBeAbleToSelectExactly([
                    context.p1Base,
                    context.p2Base
                ]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(17);
            });

            it('player takes damage from attempting to draw from empty deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['bokatan-kryze#fighting-for-mandalore'],
                        base: { card: 'echo-base', damage: 15 },
                        deck: []
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        base: { card: 'echo-base', damage: 15 }
                    }
                });

                const { context } = contextRef;

                // Attack with Bo-Katan to defeat her and attempt to draw
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.battlefieldMarine);

                // Check that no cards were drawn and player took 6 damage by attempting to draw 2 cards from an empty deck
                expect(context.player1.hand.length).toBe(0);
                expect(context.p1Base.damage).toBe(21); // 15 + 6 = 21
            });
        });
    });
});