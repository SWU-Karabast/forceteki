describe('Ezra Bridger, Spectre Six', function() {
    integration(function(contextRef) {
        describe('Ezra\'s when played ability', function() {
            it('should heal 2 damage to a unit when no Aggression or Cunning unit is controlled', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ezra-bridger#spectre-six'],
                        groundArena: [{ card: 'atst', damage: 3 }],
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.ezraBridger);
                expect(context.player1).toHavePrompt('Heal 2 damage to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.ezraBridger, context.pykeSentinel]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should heal 4 damage to a unit when an Aggression unit is controlled', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ezra-bridger#spectre-six'],
                        groundArena: [{ card: 'atst', damage: 5 }, 'sabine-wren#explosives-artist'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.ezraBridger);
                expect(context.player1).toHavePrompt('Heal 4 damage to a unit');
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should heal 4 damage to a unit when a Cunning unit is controlled', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ezra-bridger#spectre-six'],
                        groundArena: [{ card: 'atst', damage: 5 }, 'chopper#metal-menace'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.ezraBridger);
                expect(context.player1).toHavePrompt('Heal 4 damage to a unit');
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
