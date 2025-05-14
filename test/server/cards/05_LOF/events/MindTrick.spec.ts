describe('Mind Trick', function () {
    integration(function (contextRef) {
        it('Mind Trick\'s ability should allow exhausting units with combined power of 4 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mind-trick'],
                    groundArena: ['ardent-sympathizer', 'captain-tarkin#full-forward-assault']
                },
                player2: {
                    groundArena: ['wampa', 'cantina-braggart'],
                    spaceArena: ['green-squadron-awing', 'red-three#unstoppable']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.mindTrick);

            // Verify player is prompted to select units and can select units with combined power ≤ 4
            expect(context.player1).toHavePrompt('Exhaust any number of units with a combined power of 4 or less');
            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.redThree, context.greenSquadronAwing, context.cantinaBraggart, context.captainTarkin]);

            // Test selection of Wampa (power 4)
            context.player1.clickCard(context.wampa);
            // Verify only units that keep combined power ≤ 4 can be selected
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cantinaBraggart]);

            // Deselect Wampa and select Red Three instead
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.redThree);

            // Verify selectable units after selecting Red Three
            expect(context.player1).toBeAbleToSelectExactly([context.redThree, context.greenSquadronAwing, context.cantinaBraggart, context.captainTarkin]);
            // Select Cantina Braggart and Captain Tarkin to exhaust
            context.player1.clickCard(context.cantinaBraggart);
            context.player1.clickCard(context.captainTarkin);
            context.player1.clickPrompt('Done');

            expect(context.player2).toBeActivePlayer();

            // Verify selected units are exhausted
            expect(context.cantinaBraggart.exhausted).toBeTrue();
            expect(context.redThree.exhausted).toBeTrue();
            expect(context.captainTarkin.exhausted).toBeTrue();

            // Verify non-selected units remain unexhausted
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.ardentSympathizer.exhausted).toBeFalse();
            expect(context.greenSquadronAwing.exhausted).toBeFalse();

            // Player2 attacks with Green Squadron A-Wing
            context.player2.clickCard(context.greenSquadronAwing);
            context.player2.clickCard(context.p1Base);

            // Verify Red Three's ability is still active (since player1 has no Force units)
            // Red Three adds +1 damage to attacks
            expect(context.player1).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(4); // 3 base damage + 1 from Red Three ability
        });

        it('Mind Trick\'s ability should make units lose abilities when player controls a Force unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mind-trick'],
                    groundArena: ['ardent-sympathizer', 'captain-tarkin#full-forward-assault', 'grogu#irresistible']
                },
                player2: {
                    groundArena: ['wampa', 'cantina-braggart'],
                    spaceArena: ['green-squadron-awing', 'red-three#unstoppable']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.mindTrick);

            // select red three, cantina braggart and captain tarkin
            context.player1.clickCard(context.redThree);
            context.player1.clickCard(context.cantinaBraggart);
            context.player1.clickCard(context.captainTarkin);
            context.player1.clickPrompt('Done');

            expect(context.player2).toBeActivePlayer();
            expect(context.redThree.exhausted).toBeTrue();
            expect(context.cantinaBraggart.exhausted).toBeTrue();
            expect(context.captainTarkin.exhausted).toBeTrue();

            context.player2.clickCard(context.greenSquadronAwing);
            context.player2.clickCard(context.p1Base);

            // Verify Red Three's ability is now inactive due to Mind Trick's additional effect
            // (since player1 has a Force unit - Grogu)
            expect(context.player1).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(3); // Only 3 base damage, no +1 from Red Three ability
        });
    });
});
