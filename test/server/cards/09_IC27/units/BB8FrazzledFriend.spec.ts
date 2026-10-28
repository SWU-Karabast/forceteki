describe('BB-8, Frazzled Friend', function() {
    integration(function(contextRef) {
        describe('BB-8\'s On Attack ability', function() {
            it('heals 1 damage from a friendly unit and deals 1 damage to an enemy unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['bb8#frazzled-friend', { card: 'r2d2#ignoring-protocol', damage: 2 }, 'c3po#protocol-droid']
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 1 }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bb8);
                context.player1.clickCard(context.p2Base);

                // Only friendly units are selectable for healing (the enemy Wampa is not)
                expect(context.player1).toBeAbleToSelectExactly([context.bb8, context.r2d2, context.c3po]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.r2d2);

                // Then an enemy unit is selected for the damage
                expect(context.player1).toHavePrompt('Deal 1 damage to an enemy unit');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.r2d2.damage).toBe(1);
                expect(context.wampa.damage).toBe(2);
                expect(context.bb8.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('can heal BB-8 itself', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'bb8#frazzled-friend', damage: 2 }]
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bb8);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.bb8]);
                context.player1.clickCard(context.bb8);

                expect(context.player1).toHavePrompt('Deal 1 damage to an enemy unit');
                context.player1.clickCard(context.wampa);

                expect(context.bb8.damage).toBe(1);
                expect(context.wampa.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('still heals when there is no enemy unit to damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'bb8#frazzled-friend',
                            { card: 'r2d2#ignoring-protocol', damage: 2 }
                        ]
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bb8);
                context.player1.clickCard(context.p2Base);

                context.player1.clickCard(context.r2d2);

                expect(context.r2d2.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not deal damage when the chosen unit has no damage to heal', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'bb8#frazzled-friend',
                            { card: 'r2d2#ignoring-protocol', damage: 2 },
                            'c3po#protocol-droid'
                        ]
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bb8);
                context.player1.clickCard(context.p2Base);

                // Choose the undamaged C-3PO: the heal resolves for 0, so "if you do" does not trigger
                context.player1.clickCard(context.c3po);

                expect(context.c3po.damage).toBe(0);
                expect(context.r2d2.damage).toBe(2);
                expect(context.wampa.damage).toBe(0);
                expect(context.bb8.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
