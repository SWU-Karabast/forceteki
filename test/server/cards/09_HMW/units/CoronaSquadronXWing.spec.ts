describe('Corona Squadron X-Wing', function() {
    integration(function(contextRef) {
        beforeEach(async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['corona-squadron-xwing'],
                },
            });
        });

        it('should ready a resource on attack', function () {
            const { context } = contextRef;

            context.player1.exhaustResources(2);

            context.player1.clickCard(context.coronaSquadronXwing);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('You');
            context.player1.clickPrompt('Trigger');
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('should ready an enemy resource on attack', function () {
            const { context } = contextRef;

            context.player2.exhaustResources(2);

            context.player1.clickCard(context.coronaSquadronXwing);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Opponent');
            context.player1.clickPrompt('Trigger');
            expect(context.player2.exhaustedResourceCount).toBe(1);
        });

        it('should be able to be passed', function () {
            const { context } = contextRef;

            context.player2.exhaustResources(2);
            context.player1.exhaustResources(2);

            context.player1.clickCard(context.coronaSquadronXwing);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('You');
            context.player1.clickPrompt('Pass');
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.player2.exhaustedResourceCount).toBe(2);
        });
    });
});