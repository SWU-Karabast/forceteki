describe('Yoda, Trickster In Exile', function () {
    integration(function (contextRef) {
        describe('Yoda\'s when defeated ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['yoda#trickster-in-exile'],
                        base: { card: 'echo-base', damage: 5 },
                        deck: ['wampa', 'battlefield-marine']
                    },
                    player2: {
                        hand: ['vanquish'],
                        base: { card: 'chopper-base', damage: 5 }
                    }
                });
            });

            it('should put him on top of the deck and heal 2 damage from a chosen base', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.yodaTricksterInExile);

                expect(context.player1).toHavePassAbilityPrompt('Put Yoda on top of your deck');
                context.player1.clickPrompt('Trigger');

                expect(context.yodaTricksterInExile).toBeInZone('deck', context.player1);
                expect(context.player1.deck[0]).toBe(context.yodaTricksterInExile);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(3);
                expect(context.p2Base.damage).toBe(5);
                expect(context.player1).toBeActivePlayer();
            });

            it('should be able to heal the opponent\'s base instead', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.yodaTricksterInExile);

                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(5);
                expect(context.p2Base.damage).toBe(3);
                expect(context.player1.deck[0]).toBe(context.yodaTricksterInExile);
            });

            it('should do nothing if the controller declines', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.yodaTricksterInExile);

                expect(context.player1).toHavePassAbilityPrompt('Put Yoda on top of your deck');
                context.player1.clickPrompt('Pass');

                expect(context.yodaTricksterInExile).toBeInZone('discard', context.player1);
                expect(context.p1Base.damage).toBe(5);
                expect(context.p2Base.damage).toBe(5);
                expect(context.player1).toBeActivePlayer();
            });
        });

        it('Yoda\'s ability should not put him on any deck if he is defeated while controlled by the opponent via No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['yoda#trickster-in-exile'],
                    base: { card: 'echo-base', damage: 5 },
                    deck: ['wampa', 'battlefield-marine']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    base: { card: 'chopper-base', damage: 5 },
                    deck: ['atst', 'sundari-peacekeeper']
                }
            });

            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.yodaTricksterInExile);

            // Player 2 controlled Yoda when he was defeated, so the trigger resolves for them -
            // but Yoda lands in player 1's discard pile, not player 2's. Nothing should move
            // and nobody should be healed.
            expect(context.yodaTricksterInExile).toBeInZone('discard', context.player1);
            expect(context.player1.deck[0]).toBe(context.wampa);
            expect(context.player2.deck[0]).toBe(context.atst);
            expect(context.p1Base.damage).toBe(5);
            expect(context.p2Base.damage).toBe(5);
            expect(context.player1).toBeActivePlayer();
        });

        it('Yoda\'s ability should fizzle if he was moved out of the discard pile before it resolves', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['swoop-down'],
                    spaceArena: ['arquitens-assault-cruiser']
                },
                player2: {
                    groundArena: ['yoda#trickster-in-exile'],
                    base: { card: 'chopper-base', damage: 5 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.swoopDown);
            context.player1.clickCard(context.arquitensAssaultCruiser);
            context.player1.clickCard(context.yodaTricksterInExile);

            expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
            context.player1.clickPrompt('You');

            // Yoda went to player 1's resources rather than the discard pile, so the
            // trigger has nothing to move and the heal never happens.
            expect(context.yodaTricksterInExile).toBeInZone('resource', context.player1);
            expect(context.p2Base.damage).toBe(5);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
