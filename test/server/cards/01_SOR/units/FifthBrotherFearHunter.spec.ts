describe('Fifth Brother, Fear Hunter', function() {
    integration(function(contextRef) {
        const prompt = 'Deal 1 damage to this unit and 1 damage to another ground unit';

        describe('Fifth Brother\'s on attack ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['fifth-brother#fear-hunter', 'wampa'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should deal 1 damage to this unit and 1 damage to another ground unit', function () {
                const { context } = contextRef;

                // CASE 1: no damage on Fifth Brother, no raid
                context.player1.clickCard(context.fifthBrother);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt('Pass');

                expect(context.fifthBrother.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();
                context.setDamage(context.p2Base, 0);
                context.fifthBrother.exhausted = false;

                // CASE 2: Fifth Brother damages himself and another target, gets Raid 1
                context.player1.clickCard(context.fifthBrother);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt(prompt);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.rebelPathfinder]);
                context.player1.clickCard(context.wampa);

                expect(context.fifthBrother.damage).toBe(1);
                expect(context.wampa.damage).toBe(1);
                expect(context.p2Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();

                // CASE 3: Raid damage is not active when Fifth Brother is defending
                context.player2.clickCard(context.rebelPathfinder);
                context.player2.clickCard(context.fifthBrother);
                expect(context.rebelPathfinder.damage).toBe(2);

                context.setDamage(context.p2Base, 0);
                context.fifthBrother.exhausted = false;

                // CASE 4: Fifth Brother does no combat damage if he dies to his ability at the attack step
                context.player1.clickCard(context.fifthBrother);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt(prompt);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.rebelPathfinder]);
                context.player1.clickCard(context.wampa);

                // fifth brother is defeated by its ability, attack damage doesn't resolve
                expect(context.fifthBrother).toBeInZone('discard');
                expect(context.wampa.damage).toBe(2);
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
