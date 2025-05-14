describe('Old Daka, Oldest and Wisest', function() {
    integration(function(contextRef) {
        describe('Old Daka\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'asajj-ventress#i-work-alone', deployed: true },
                        hand: ['old-daka#oldest-and-wisest', 'change-of-heart'],
                        groundArena: ['talzins-assassin', 'wampa'],
                    },
                    player2: {
                        groundArena: ['daughter-of-dathomir']
                    }
                });
            });

            it('should allow defeating a friendly Night unit and then playing it for free from discard', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.oldDaka);
                expect(context.player1).toBeAbleToSelectExactly([context.talzinsAssassin, context.asajjVentress]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.talzinsAssassin);

                const p1ResourceCount = context.player1.readyResourceCount;
                expect(context.talzinsAssassin).toBeInZone('discard');
                expect(context.player1).toHavePassAbilityPrompt('Play Talzin\'s Assassin from your discard pile for free');
                context.player1.clickPrompt('Trigger');

                expect(context.talzinsAssassin).toBeInZone('groundArena');
                expect(context.player1.readyResourceCount).toBe(p1ResourceCount);
            });

            it('should allow defeating a friendly Night leader and then do nothing', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.oldDaka);
                expect(context.player1).toBeAbleToSelectExactly([context.talzinsAssassin, context.asajjVentress]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.asajjVentress);

                expect(context.asajjVentress.deployed).toBe(false);
                expect(context.asajjVentress).toBeInZone('base');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow defeating a stolen friendly Night unit and then do nothing', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.daughterOfDathomir);

                context.player2.passAction();

                context.player1.clickCard(context.oldDaka);
                expect(context.player1).toBeAbleToSelectExactly([context.talzinsAssassin, context.daughterOfDathomir, context.asajjVentress]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.daughterOfDathomir);

                expect(context.daughterOfDathomir).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});