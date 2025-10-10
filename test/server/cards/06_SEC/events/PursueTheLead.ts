describe('Pursue the Lead', function() {
    integration(function(contextRef) {
        describe('Pursue the Lead\' ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['pursue-the-lead', 'resupply'],
                    },
                    player2: {
                        hand: ['wampa', 'yoda#old-master', 'porg']
                    }
                });
            });

            it('should choose a player to discard a card, if it costs 3 or less, create a spy token (cost is 3)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.pursueTheLead);
                expect(context.player1).toHaveExactPromptButtons(['You discard', 'Opponent discards']);
                context.player1.clickPrompt('Opponent discards');
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.yoda, context.porg]);
                context.player2.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();

                const spies = context.player1.findCardsByName('spy');
                expect(spies.length).toBe(1);
                expect(spies).toAllBeInZone('groundArena');
                expect(spies.every((spy) => spy.exhausted)).toBeTrue();
            });

            it('should choose a player to discard a card, if it costs 3 or less, create a spy token (cost less than 3)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.pursueTheLead);
                expect(context.player1).toHaveExactPromptButtons(['You discard', 'Opponent discards']);
                context.player1.clickPrompt('Opponent discards');
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.yoda, context.porg]);
                context.player2.clickCard(context.porg);

                expect(context.player2).toBeActivePlayer();

                const spies = context.player1.findCardsByName('spy');
                expect(spies.length).toBe(1);
                expect(spies).toAllBeInZone('groundArena');
                expect(spies.every((spy) => spy.exhausted)).toBeTrue();
            });

            it('should choose a player to discard a card, if it costs 3 or less, create a spy token (cost is 4)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.pursueTheLead);
                expect(context.player1).toHaveExactPromptButtons(['You discard', 'Opponent discards']);
                context.player1.clickPrompt('Opponent discards');
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.yoda, context.porg]);
                context.player2.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();

                const spies = context.player1.findCardsByName('spy');
                expect(spies.length).toBe(0);
            });

            it('should choose a player to discard a card, if it costs 3 or less, create a spy token (discard yourself)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.pursueTheLead);
                expect(context.player1).toHaveExactPromptButtons(['You discard', 'Opponent discards']);
                context.player1.clickPrompt('You discard');
                expect(context.player1).toBeAbleToSelectExactly([context.resupply]);
                context.player1.clickCard(context.resupply);

                expect(context.player2).toBeActivePlayer();

                const spies = context.player1.findCardsByName('spy');
                expect(spies.length).toBe(1);
                expect(spies).toAllBeInZone('groundArena');
                expect(spies.every((spy) => spy.exhausted)).toBeTrue();
            });
        });

        it('should choose a player to discard a card, if it costs 3 or less, create a spy token (opponent has empty hand)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pursue-the-lead', 'resupply'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.pursueTheLead);
            expect(context.player1).toHaveExactPromptButtons(['You discard', 'Opponent discards']);
            context.player1.clickPrompt('Opponent discards');

            expect(context.player2).toBeActivePlayer();

            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(0);
        });

        it('should choose a player to discard a card, if it costs 3 or less, create a spy token (both players have empty hand)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pursue-the-lead'],
                },
                player2: {}
            });

            const { context } = contextRef;

            context.player1.clickCard(context.pursueTheLead);
            expect(context.player1).toHaveExactPromptButtons(['You discard', 'Opponent discards']);
            context.player1.clickPrompt('You discard');

            expect(context.player2).toBeActivePlayer();

            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(0);
        });
    });
});