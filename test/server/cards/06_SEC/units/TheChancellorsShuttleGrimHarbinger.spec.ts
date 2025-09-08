describe('The Chancellor\'s Shuttle, Grim Harbinger', function() {
    integration(function(contextRef) {
        it('When defeated, if you control Chancellor Palpatine you may give an Experience token to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chancellor-palpatine#how-liberty-dies',
                    spaceArena: ['the-chancellors-shuttle#grim-harbinger'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa'],
                    hand: ['vanquish'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            // Defeat the Shuttle to trigger the ability
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.theChancellorsShuttleGrimHarbinger);

            expect(context.player1).toHavePassAbilityPrompt('If you control Chancellor Palpatine, you may give an Experience token to a unit.');
            context.player1.clickPrompt('Trigger');

            // Expect ability to select any unit (friendly, enemy, or leader unit)
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);

            // Choose friendly Battlefield Marine to receive Experience
            context.player1.clickCard(context.battlefieldMarine);

            // Verify the Experience token was granted
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            expect(context.player1).toBeActivePlayer();
        });

        it('Ability should not trigger if you do not control Chancellor Palpatine', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chirrut-imwe#one-with-the-force',
                    spaceArena: ['the-chancellors-shuttle#grim-harbinger'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    leader: 'chancellor-palpatine#playing-both-sides',
                    groundArena: ['wampa'],
                    hand: ['vanquish'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            // Defeat the Shuttle
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.theChancellorsShuttleGrimHarbinger);

            expect(context.player1).toBeActivePlayer();
            expect(context.battlefieldMarine.isUpgraded()).toBeFalse();
            expect(context.wampa.isUpgraded()).toBeFalse();
        });

        it('ability should trigger for opponent if he plays No Glory Only Results and controls Chancellor Palpatine', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chirrut-imwe#one-with-the-force',
                    spaceArena: ['the-chancellors-shuttle#grim-harbinger'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa', 'chancellor-palpatine#wartime-chancellor'],
                    hand: ['no-glory-only-results'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            // Defeat the Shuttle
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.theChancellorsShuttleGrimHarbinger);

            expect(context.player2).toHavePassAbilityPrompt('If you control Chancellor Palpatine, you may give an Experience token to a unit.');
            context.player2.clickPrompt('Trigger');

            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.chancellorPalpatine, context.wampa]);
            context.player2.clickCard(context.wampa);

            expect(context.player1).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            expect(context.battlefieldMarine.isUpgraded()).toBeFalse();
        });
    });
});
