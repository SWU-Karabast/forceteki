describe('Shien Flurry', function() {
    integration(function(contextRef) {
        describe('Shien Flurry\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['shien-flurry', 'obiwan-kenobi#following-fate', 'luke-skywalker#jedi-knight', 'atst'],
                        leader: 'kanan-jarrus#help-us-survive',
                        base: 'administrators-tower',
                        resources: 7,
                    },
                    player2: {
                        groundArena: ['wampa', 'battlefield-marine', 'cantina-braggart'],
                    }
                });
            });

            it('should allow playing a Force unit from hand, give it Ambush, and prevent 2 damage the next time it would be dealt damage (damage from ambush)', function() {
                const { context } = contextRef;
                const { player1, player2 } = context;

                // Play Shien Flurry
                player1.clickCard(context.shienFlurry);

                // Select Obi-Wan Kenobi from hand
                expect(player1).toBeAbleToSelectExactly([context.obiwanKenobi]);
                player1.clickCard(context.obiwanKenobi);

                // ambush wampa
                expect(player1).toHavePassAbilityPrompt('Ambush');
                player1.clickPrompt('Trigger');
                player1.clickCard(context.wampa);

                expect(player2).toBeActivePlayer();
                expect(player1.exhaustedResourceCount).toBe(7); // 1 + 6

                // 2 damages should have been prevented
                expect(context.obiwanKenobi.damage).toBe(2);
            });

            it('should allow playing a Force unit from hand, give it Ambush, and prevent 2 damage the next time it would be dealt damage (no damage from ambush)', function() {
                const { context } = contextRef;
                const { player1, player2 } = context;

                // Play Shien Flurry
                player1.clickCard(context.shienFlurry);

                // Select Obi-Wan Kenobi from hand
                expect(player1).toBeAbleToSelectExactly([context.obiwanKenobi]);
                player1.clickCard(context.obiwanKenobi);

                player1.clickPrompt('Trigger');
                player1.clickCard(context.cantinaBraggart);
                // no damage here, damage should be prevented next time

                // wampa attack obiwan kenobi
                player2.clickCard(context.wampa);
                player2.clickCard(context.obiwanKenobi);

                // 2 damages should have been prevented
                expect(context.obiwanKenobi.damage).toBe(2);
            });

            it('should allow playing a Force unit from hand, give it Ambush, and prevent 2 damage the next time it would be dealt damage (move to next phase)', function() {
                const { context } = contextRef;
                const { player1, player2 } = context;

                // Play Shien Flurry
                player1.clickCard(context.shienFlurry);

                // Select Obi-Wan Kenobi from hand
                expect(player1).toBeAbleToSelectExactly([context.obiwanKenobi]);
                player1.clickCard(context.obiwanKenobi);

                // pass ambush
                player1.clickPrompt('Pass');

                // move to next phase, damage should not be prevented anymore
                context.moveToNextActionPhase();
                player1.passAction();

                // wampa attack obiwan kenobi
                player2.clickCard(context.wampa);
                player2.clickCard(context.obiwanKenobi);

                expect(context.obiwanKenobi.damage).toBe(4);
            });
        });

        it('Shien Flurry\'s ability should allow playing a Force unit from hand, give it Ambush, and prevent 2 damage the next time it would be dealt damage (move to next phase)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['shien-flurry', 'atst'],
                    base: 'administrators-tower',
                },
            });

            const { context } = contextRef;
            const { player1, player2 } = context;

            player1.clickCard(context.shienFlurry);
            expect(player2).toBeActivePlayer();
            expect(player1.exhaustedResourceCount).toBe(1);
        });
    });
});