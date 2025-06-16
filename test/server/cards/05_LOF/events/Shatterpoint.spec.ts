describe('Shatterpoint', function() {
    integration(function(contextRef) {
        describe('Shatterpoint\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['shatterpoint'],
                        hasForceToken: true,
                        groundArena: [{ card: 'wampa', damage: 2 }],
                        leader: { card: 'chewbacca#walking-carpet', deployed: true }
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('should use the force to defeat a non-leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.shatterpoint);
                expect(context.player1).toHaveExactPromptButtons([
                    'Defeat a non-leader unit with 3 or less remaining HP',
                    'Use the Force. If you do, defeat a non-leader unit',
                ]);
                context.player1.clickPrompt('Use the Force. If you do, defeat a non-leader unit');
                expect(context.getChatLogs(1)).toContain('player1 chooses "Use the Force. If you do, defeat a non-leader unit"');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.greenSquadronAwing]);
                context.player1.clickCard(context.atst);


                expect(context.player2).toBeActivePlayer();
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.atst).toBeInZone('discard', context.player2);
            });

            it('should choose the "use the force" option but without the force nothing happen', function () {
                const { context } = contextRef;

                context.player1.setHasTheForce(false);

                context.player1.clickCard(context.shatterpoint);
                expect(context.player1).toHaveExactPromptButtons([
                    'Defeat a non-leader unit with 3 or less remaining HP',
                    'Use the Force. If you do, defeat a non-leader unit',
                ]);
                context.player1.clickPrompt('Use the Force. If you do, defeat a non-leader unit');

                expect(context.player2).toBeActivePlayer();
                expect(context.atst).toBeInZone('groundArena', context.player2);
            });

            it('should defeat a non-leader unit with 3 or less remaining HP', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.shatterpoint);
                expect(context.player1).toHaveExactPromptButtons([
                    'Defeat a non-leader unit with 3 or less remaining HP',
                    'Use the Force. If you do, defeat a non-leader unit',
                ]);
                context.player1.clickPrompt('Defeat a non-leader unit with 3 or less remaining HP');
                expect(context.getChatLogs(1)).toContain('player1 chooses "Defeat a non-leader unit with 3 or less remaining HP"');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);
                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.hasTheForce).toBeTrue();
                expect(context.greenSquadronAwing).toBeInZone('discard', context.player2);
            });
        });
    });
});