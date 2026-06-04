describe('Reckoning', function() {
    integration(function(contextRef) {
        describe('its event ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reckoning'],
                        groundArena: [{ card: 'wampa', damage: 3 }, 'krayt-dragon'],
                        spaceArena: [{ card: 'stolen-athauler', damage: 1 }],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true, damage: 2 }
                    },
                    player2: {
                        groundArena: ['reinforcement-walker'],
                        spaceArena: [{ card: 'arquitens-assault-cruiser', damage: 1 }]
                    }
                });
            });

            it('should deal damage to a unit equal to the sum of damage on all friendly units', function() {
                const { context } = contextRef;

                // 3 damage on Wampa + 1 damage on Stolen AT-Hauler + 2 damage on Grand Inquisitor = 6 total
                context.player1.clickCard(context.reckoning);
                expect(context.player1).toHavePrompt('Choose a unit to deal 6 damage to');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.kraytDragon, context.stolenAthauler, context.grandInquisitor, context.reinforcementWalker, context.arquitensAssaultCruiser]);
                context.player1.clickCard(context.reinforcementWalker);

                expect(context.getChatLogs()).toEqual([
                    'player1 plays Reckoning to deal 6 damage to Reinforcement Walker'
                ]);
                expect(context.reinforcementWalker.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow damaging a space unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.reckoning);

                // Target the space unit
                context.player1.clickCard(context.arquitensAssaultCruiser);

                expect(context.getChatLogs()).toEqual([
                    'player1 plays Reckoning to deal 6 damage to Arquitens Assault Cruiser'
                ]);
                expect(context.arquitensAssaultCruiser.damage).toBe(7);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow damaging a friendly unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.reckoning);

                // Target the friendly unit
                context.player1.clickCard(context.kraytDragon);

                expect(context.getChatLogs()).toEqual([
                    'player1 plays Reckoning to deal 6 damage to Krayt Dragon'
                ]);
                expect(context.kraytDragon.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('when no friendly units have any damage', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['reckoning'],
                        groundArena: ['wampa', 'krayt-dragon'],
                    },
                    player2: {
                        groundArena: ['reinforcement-walker']
                    }
                });
            });

            it('should resolve without a targeting prompt since 0 damage would not change game state', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.reckoning);

                // 0 damage total — ability fizzles without prompting to select a target
                expect(context.reinforcementWalker.damage).toBe(0);
                expect(context.getChatLogs()).toEqual([
                    'player1 plays Reckoning'
                ]);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
