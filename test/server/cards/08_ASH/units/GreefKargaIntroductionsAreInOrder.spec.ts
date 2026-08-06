describe('Greef Karga, Introductions Are In Order', function() {
    integration(function(contextRef) {
        it('should not make a Mandalorian token if the base has not been attacked', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'greef-karga#introductions-are-in-order']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.greefKarga);
            context.player1.clickPrompt('(No effect) Create a Mandalorian token');
            context.player1.clickPrompt('Use it anyway');

            const mandalorians = context.player1.findCardsByName('mandalorian');
            expect(mandalorians.length).toBe(0);
            expect(context.greefKarga.exhausted).toBeTrue();
            expect(context.player1.exhaustedResourceCount).toBe(1);

            expect(context.player2).toBeActivePlayer();
        });

        it('should make a Mandalorian token if the base has been attacked', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['greef-karga#introductions-are-in-order']
                },
                player2: {
                    groundArena: ['wampa'],
                    hasInitiative: true
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);

            context.player1.clickCard(context.greefKarga);
            context.player1.clickPrompt('Create a Mandalorian token');

            const mandalorians = context.player1.findCardsByName('mandalorian');
            expect(mandalorians.length).toBe(1);
            expect(mandalorians.every((x) => x.exhausted)).toBeTrue();
            expect(context.greefKarga.exhausted).toBeTrue();
            expect(context.player1.exhaustedResourceCount).toBe(1);

            expect(context.player2).toBeActivePlayer();
        });

        it('should not make a Mandalorian token if the enemy base was been attacked', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'greef-karga#introductions-are-in-order']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();

            context.player1.clickCard(context.greefKarga);
            context.player1.clickPrompt('(No effect) Create a Mandalorian token');
            context.player1.clickPrompt('Use it anyway');

            const mandalorians = context.player1.findCardsByName('mandalorian');
            expect(mandalorians.length).toBe(0);
            expect(context.greefKarga.exhausted).toBeTrue();
            expect(context.player1.exhaustedResourceCount).toBe(1);

            expect(context.player2).toBeActivePlayer();
        });
    });
});