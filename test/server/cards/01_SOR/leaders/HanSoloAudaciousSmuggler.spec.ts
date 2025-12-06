describe('Han Solo, Audacious Smuggler', function() {
    integration(function(contextRef) {
        describe('Han Solo\'s leader ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        hand: ['pyke-sentinel', 'wampa'],
                        deck: ['liberated-slaves', 'vanquish'],
                        resources: ['cunning', 'aggression', 'spark-of-rebellion', 'protector', 'atst'],
                    },
                    player2: {
                        groundArena: ['moisture-farmer'],
                    }
                });
            });

            it('should put a card into play from hand as a ready resource and then defeat a resource at the start of the next action phase', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.hanSolo);
                expect(context.player1.readyResourceCount).toBe(5);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('resource', context.player1);
                expect(context.player1.readyResourceCount).toBe(6);

                context.player2.claimInitiative();
                context.player1.passAction();
                context.player2.clickDone();
                context.player1.clickDone();

                expect(context.player1).toHavePrompt('Choose a resource to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cunning, context.aggression, context.sparkOfRebellion, context.protector, context.atst]);
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.aggression);
                expect(context.aggression).toBeInZone('discard', context.player1);
                expect(context.player1.readyResourceCount).toBe(5);
                expect(context.getChatLogs(1)).toEqual([
                    'player1 uses Han Solo to defeat a ready Aggression',
                ]);
            });

            it('should defeat two resources at the start of the next action phase if both han abilities are used in the same turn', function() {
                const { context } = contextRef;

                // Use Han hand-resource ability
                context.player1.clickCard(context.hanSolo);
                expect(context.player1.readyResourceCount).toBe(5);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('resource', context.player1);
                expect(context.player1.readyResourceCount).toBe(6);

                // Deploy Han and attack with him
                context.player2.passAction();
                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Deploy Han Solo');
                context.player2.passAction();
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.readyResourceCount).toBe(7);
                expect(context.liberatedSlaves).toBeInZone('resource', context.player1);

                context.player2.claimInitiative();
                context.player1.passAction();
                context.player2.clickDone();
                context.player1.clickDone();

                expect(context.player1).toHavePrompt('Choose a resource to defeat');
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player1);

                expect(context.player1).toHavePrompt('Choose a resource to defeat');
                context.player1.clickCard(context.liberatedSlaves);
                expect(context.liberatedSlaves).toBeInZone('discard', context.player1);

                expect(context.player1.readyResourceCount).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('should work when used two turns in a row', function() {
                const { context } = contextRef;

                // first Han ability activation
                context.player1.clickCard(context.hanSolo);
                expect(context.player1.readyResourceCount).toBe(5);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('resource', context.player1);
                expect(context.player1.readyResourceCount).toBe(6);

                context.player2.claimInitiative();
                context.player1.passAction();
                context.player2.clickDone();
                context.player1.clickDone();

                expect(context.player1).toHavePrompt('Choose a resource to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cunning, context.aggression, context.sparkOfRebellion, context.protector, context.atst]);
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.aggression);
                expect(context.aggression).toBeInZone('discard', context.player1);
                expect(context.player1.readyResourceCount).toBe(5);

                // second Han ability activation
                context.player2.passAction();
                context.player1.clickCard(context.hanSolo);
                expect(context.player1.readyResourceCount).toBe(5);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.liberatedSlaves, context.vanquish]);
                context.player1.clickCard(context.vanquish);
                expect(context.vanquish).toBeInZone('resource', context.player1);
                expect(context.player1.readyResourceCount).toBe(6);

                context.player2.claimInitiative();
                context.player1.passAction();
                context.player2.clickDone();
                context.player1.clickDone();

                expect(context.player1).toHavePrompt('Choose a resource to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cunning, context.vanquish, context.sparkOfRebellion, context.protector, context.atst]);
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.vanquish);
                expect(context.vanquish).toBeInZone('discard', context.player1);
                expect(context.player1.readyResourceCount).toBe(5);
            });
        });

        describe('Han Solo\'s leader unit ability', function() {
            it('should put the top card of his deck into play as a ready resource and then defeat a resource at the start of the next action phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'han-solo#audacious-smuggler', deployed: true },
                        deck: ['wampa'],
                        resources: 6
                    }
                });

                const { context } = contextRef;

                expect(context.player1.readyResourceCount).toBe(6);
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.readyResourceCount).toBe(7);
                expect(context.wampa).toBeInZone('resource', context.player1);
                expect(context.getChatLog()).toEqual('player1 uses Han Solo to move a card to their resources and to ready it and to defeat a resource at the start of the next action phase');

                context.player2.claimInitiative();
                context.player1.passAction();
                context.player2.clickDone();
                context.player1.clickDone();

                expect(context.player1).toHavePrompt('Choose a resource to defeat');
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.player1.readyResourceCount).toBe(6);
            });

            it('should have to defeat a resource even if the deck was empty when Han attacked as a deployed leader', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'han-solo#audacious-smuggler', deployed: true },
                        deck: [],
                        resources: ['wampa', 'cunning', 'aggression', 'spark-of-rebellion', 'protector', 'atst'],
                    }
                });

                const { context } = contextRef;

                expect(context.player1.readyResourceCount).toBe(6);
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.readyResourceCount).toBe(6);
                expect(context.wampa).toBeInZone('resource', context.player1);

                context.player2.claimInitiative();
                context.player1.passAction();
                context.player2.clickDone();
                context.player1.clickDone();

                expect(context.player1).toHavePrompt('Choose a resource to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cunning, context.aggression, context.sparkOfRebellion, context.protector, context.atst]);
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.cunning);
                expect(context.cunning).toBeInZone('discard', context.player1);
                expect(context.player1.readyResourceCount).toBe(5);
            });
        });
    });
});
