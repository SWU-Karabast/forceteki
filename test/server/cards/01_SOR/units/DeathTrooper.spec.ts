describe('Death Trooper', function() {
    integration(function(contextRef) {
        describe('Death Trooper\'s When Played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['death-trooper'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa', 'superlaser-technician'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('can only target ground units & can damage itself', function () {
                const { context } = contextRef;

                // Play Death Trooper
                context.player1.clickCard(context.deathTrooper);

                // Choose Friendly
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.deathTrooper]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.deathTrooper);

                // Choose Enemy
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.superlaserTechnician]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
            });

            it('works when no enemy ground units', function () {
                const { context } = contextRef;

                // Play Death Trooper
                context.player2.setGroundArenaUnits([]);
                context.player1.clickCard(context.deathTrooper);

                // Choose Friendly
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.deathTrooper]);
                expect(context.player1).not.toHavePassAbilityPrompt('Deal 2 damage to a friendly ground unit and an enemy ground unit');
                context.player1.clickCard(context.deathTrooper);
                expect(context.deathTrooper.damage).toEqual(2);
            });
        });
    });
});
