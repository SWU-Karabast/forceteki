describe('Shin Hati\'s Fiend Fighter, Compact and Agile', function() {
    integration(function(contextRef) {
        describe('When Defeated ability', function() {
            it('may give 2 Advantage tokens to a unit when defeated by combat damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['shin-hatis-fiend-fighter#compact-and-agile']
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.shinHatisFiendFighter);
                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.shinHatisFiendFighter).toBeInZone('discard');
                expect(context.greenSquadronAwing).toBeInZone('discard');
                expect(context.player1).toHavePrompt('Give 2 Advantage tokens to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage', 'advantage']);
            });

            it('may give 3 Advantage tokens to a unit instead when not defeated by combat damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['shin-hatis-fiend-fighter#compact-and-agile']
                    },
                    player2: {
                        hand: ['vanquish'],
                        resources: 10
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.shinHatisFiendFighter);

                expect(context.player1).toHavePrompt('Give 3 Advantage tokens to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
            });

            it('may be passed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['shin-hatis-fiend-fighter#compact-and-agile']
                    },
                    player2: {
                        hand: ['vanquish'],
                        resources: 10
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.shinHatisFiendFighter);
                context.player1.clickPrompt('Pass');

                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            });
        });
    });
});
