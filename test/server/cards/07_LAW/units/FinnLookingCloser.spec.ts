describe('Finn, Looking Closer', function() {
    integration(function(contextRef) {
        describe('Finn\'s on attack ability', function() {
            it('should optionally give a Shield token to a non-unique unit when attacking', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['finn#looking-closer', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['wampa', 'darth-vader#commanding-the-first-legion'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.finn);
                context.player1.clickCard(context.p2Base);

                // Should be able to select non-unique units only (both friendly and enemy)
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to give a Shield token to an enemy non-unique unit which protects it during combat', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['finn#looking-closer'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.finn);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                // Shield is given before combat damage, so Wampa takes no damage (shield absorbs it)
                expect(context.finn.damage).toBe(4);
                expect(context.wampa.damage).toBe(0);
                expect(context.wampa.isUpgraded()).toBeFalse(); // Shield was consumed
                expect(context.player2).toBeActivePlayer();
            });

            it('should not be able to select unique units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['finn#looking-closer', 'luke-skywalker#jedi-knight'],
                    },
                    player2: {
                        groundArena: ['darth-vader#commanding-the-first-legion'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.finn);
                context.player1.clickCard(context.p2Base);

                // No non-unique units available, ability should auto-pass
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
