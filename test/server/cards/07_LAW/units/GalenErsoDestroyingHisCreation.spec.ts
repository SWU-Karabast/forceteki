describe('Galen Erso, Destroying His Creation', () => {
    integration(function(contextRef) {
        describe('When Played ability', function() {
            it('optionally allows the player to give control of Galen to their opponent', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#destroying-his-creation'],
                    }
                });

                const { context } = contextRef;

                // Player 1 plays Galen Erso
                context.player1.clickCard(context.galenErso);
                expect(context.galenErso).toBeInZone('groundArena', context.player1);

                // Ability triggers
                expect(context.player1).toHavePassAbilityPrompt('Your opponent takes control of this unit');
                context.player1.clickPrompt('Trigger');

                // Verify control has changed
                expect(context.galenErso).toBeInZone('groundArena', context.player2);
            });

            it('lets the player keep control of Galen', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#destroying-his-creation'],
                    }
                });

                const { context } = contextRef;

                // Player 1 plays Galen Erso
                context.player1.clickCard(context.galenErso);
                expect(context.galenErso).toBeInZone('groundArena', context.player1);

                // Ability triggers
                expect(context.player1).toHavePassAbilityPrompt('Your opponent takes control of this unit');
                context.player1.clickPrompt('Pass');

                // Verify control has not changed
                expect(context.galenErso).toBeInZone('groundArena', context.player1);
            });
        });

        describe('Constant ability', function() {
            it('gives enemy units Raid 1 and Saboteur', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#destroying-his-creation'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                    }
                });

                const { context } = contextRef;

                // Player 1 initiates an attack with Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel]);

                // Cancel the action to play Galen Erso instead
                context.player1.clickPrompt('Cancel');
                context.player1.clickCard(context.galenErso);
                context.player1.clickPrompt('Trigger');

                context.player2.passAction();

                // Player 1 initiates an attack with Battlefield Marine again
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.pykeSentinel,
                    context.galenErso,
                    context.p2Base
                ]);
                context.player1.clickCard(context.p2Base);

                // Verify damage buff from Raid 1
                expect(context.p2Base.damage).toBe(4);
            });

            it('friendly units do not gain Raid 1 or Saboteur', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#destroying-his-creation'],
                        groundArena: ['pyke-sentinel']
                    },
                    player2: {
                        groundArena: ['echo-base-defender'],
                    }
                });

                const { context } = contextRef;

                // Player 1 plays Galen Erso
                context.player1.clickCard(context.galenErso);
                context.player1.clickPrompt('Pass');

                context.player2.passAction();

                // Attack with Pyke Sentinel
                context.player1.clickCard(context.pykeSentinel);
                expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender]);

                // Verify no damage buff from Raid 1
                context.player1.clickCard(context.echoBaseDefender);
                expect(context.echoBaseDefender.damage).toBe(2);
            });
        });
    });
});