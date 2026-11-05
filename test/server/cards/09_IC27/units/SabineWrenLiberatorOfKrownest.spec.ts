describe('Sabine Wren, Liberator of Krownest', function() {
    integration(function(contextRef) {
        describe('Sabine Wren, Liberator of Krownest When Played ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sabine-wren#liberator-of-krownest'],
                        deck: ['battlefield-marine', 'reinforcement-walker'],
                        groundArena: ['ezra-bridger#down-with-the-freedom']
                    },
                    player2: {
                        deck: ['green-squadron-awing', 'rogue-squadron-skirmisher'],
                        spaceArena: ['home-one#alliance-flagship'],
                    }
                });
            });

            it('should allow discarding top 2 cards from own deck and dealing damage to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);

                expect(context.player1).toHavePrompt('Select one');
                context.player1.clickPrompt('Your deck');

                // Discarded cards are Battlefield Marine and Home One, Alliance Flagship
                expect(context.getChatLogs(2)).toContain('player1 uses Sabine Wren to discard Battlefield Marine and Reinforcement Walker from their deck');

                expect(context.player1).toBeAbleToSelectExactly([context.ezraBridger, context.sabineWren, context.homeOne]);
                context.player1.clickCard(context.homeOne);

                expect(context.homeOne.damage).toBe(6);

                expect(context.player1.deck.length).toBe(0);
                expect(context.player1.discard).toContain(context.battlefieldMarine);
                expect(context.player1.discard).toContain(context.reinforcementWalker);
            });

            it('should allow discarding top 2 cards from opponent\'s deck and dealing damage to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);

                expect(context.player1).toHavePrompt('Select one');
                context.player1.clickPrompt('Opponent\'s deck');

                // Discarded cards are Battlefield Marine and Home One, Alliance Flagship
                expect(context.getChatLogs(2)).toContain('player1 uses Sabine Wren to discard Green Squadron A-Wing and Rogue Squadron Skirmisher from player2\'s deck');

                expect(context.player1).toBeAbleToSelectExactly([context.ezraBridger, context.sabineWren, context.homeOne]);
                context.player1.clickCard(context.homeOne);

                expect(context.homeOne.damage).toBe(4);

                expect(context.player2.deck.length).toBe(0);
                expect(context.player2.discard).toContain(context.greenSquadronAwing);
                expect(context.player2.discard).toContain(context.rogueSquadronSkirmisher);
            });

            it('should allow discarding top 2 cards from own deck and passing on dealing damage to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);

                expect(context.player1).toHavePrompt('Select one');
                context.player1.clickPrompt('Your deck');

                // Discarded cards are Battlefield Marine and Home One, Alliance Flagship
                expect(context.getChatLogs(2)).toContain('player1 uses Sabine Wren to discard Battlefield Marine and Reinforcement Walker from their deck');

                expect(context.player1).toHaveEnabledPromptButton('Pass');
                context.player1.clickPrompt('Pass');

                expect(context.homeOne.damage).toBe(0);

                expect(context.player1.deck.length).toBe(0);
                expect(context.player1.discard).toContain(context.battlefieldMarine);
                expect(context.player1.discard).toContain(context.reinforcementWalker);
            });
        });
    });
});