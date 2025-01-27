describe('Han Solo, Audacious Smuggler', function() {
    integration(function(contextRef) {
        describe('Han Solo\'s leader ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        hand: ['pyke-sentinel', 'wampa'],
                        deck: ['liberated-slaves'],
                        resources: 5,
                    },
                    player2: {
                        groundArena: ['moisture-farmer'],
                    }
                });
            });

            it('should put a card into play from hand as a ready resource and then defeat a resource at the start of the next action phase', function() {
                const { context } = contextRef;
                context.player1.clickCard('han-solo#audacious-smuggler');
                expect(context.player1.readyResourceCount).toBe(5);
                expect(context.player1).toBeAbleToSelectExactly(['pyke-sentinel', 'wampa']);
                context.player1.clickCard('wampa');
                expect(context.wampa).toBeInZone('resource', context.player1);
                expect(context.player1.readyResourceCount).toBe(6);

                context.player2.claimInitiative();
                context.player1.passAction();
                context.player2.clickPrompt('Done');
                context.player1.clickPrompt('Done');

                expect(context.player1).toHavePrompt('Defeat a resource you control');
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.player1.readyResourceCount).toBe(5);
            });

            it('should defeat two resources at the start of the next action phase if both han abilities are used in the same turn', function() {
                const { context } = contextRef;

                // Use Han hand-resource ability
                context.player1.clickCard(context.hanSolo);
                expect(context.player1.readyResourceCount).toBe(5);
                expect(context.player1).toBeAbleToSelectExactly(['pyke-sentinel', 'wampa']);
                context.player1.clickCard('wampa');
                expect(context.wampa).toBeInZone('resource', context.player1);
                expect(context.player1.readyResourceCount).toBe(6);

                // Deploy Han and attack with him
                context.player2.passAction();
                context.player1.clickCard(context.hanSolo);
                context.player2.passAction();
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.readyResourceCount).toBe(7);
                expect(context.liberatedSlaves).toBeInZone('resource', context.player1);

                context.player2.claimInitiative();
                context.player1.passAction();
                context.player2.clickPrompt('Done');
                context.player1.clickPrompt('Done');

                expect(context.player1).toHavePrompt('Defeat a resource you control');
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player1);

                expect(context.player1).toHavePrompt('Defeat a resource you control');
                context.player1.clickCard(context.liberatedSlaves);
                expect(context.liberatedSlaves).toBeInZone('discard', context.player1);

                expect(context.player1.readyResourceCount).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Han Solo\'s leader unit ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'han-solo#audacious-smuggler', deployed: true },
                        deck: ['wampa'],
                        resources: 6
                    }
                });
            });

            it('should put the top card of his deck into play as a ready resource and then defeat a resource at the start of the next action phase', function() {
                const { context } = contextRef;
                expect(context.player1.readyResourceCount).toBe(6);
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.readyResourceCount).toBe(7);
                expect(context.wampa).toBeInZone('resource', context.player1);

                context.player2.claimInitiative();
                context.player1.passAction();
                context.player2.clickPrompt('Done');
                context.player1.clickPrompt('Done');

                expect(context.player1).toHavePrompt('Defeat a resource you control');
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.player1.readyResourceCount).toBe(6);
            });
        });
    });
});
