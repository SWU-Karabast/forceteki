describe('Clone', function() {
    integration(function(contextRef) {
        describe('when played from hand', function() {
            it('should enter play as non-unique copy of another unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone', 'l337#droid-revolutionary'],
                        groundArena: ['wampa', 'enfys-nest#champion-of-justice'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst', 'first-order-stormtrooper'],
                        hand: ['discerning-veteran'],
                    }
                });

                const { context } = contextRef;

                expect(context.clone.getPrintedPower()).toBe(0);
                expect(context.clone.getPrintedHp()).toBe(0);

                // Clone enters play...
                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.firstOrderStormtrooper]);

                // ...as a copy of Enfys Nest and triggers its when played ability
                context.player1.clickCard(context.enfysNest);
                expect(context.player1).toHavePrompt('Return an enemy non-leader unit with less power than this unit to its owner\'s hand');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.firstOrderStormtrooper]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('hand');

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone.getPrintedPower()).toBe(5);
                expect(context.clone.getPrintedHp()).toBe(7);

                // Discerning Veteran captures Clone
                context.player2.clickCard(context.discerningVeteran);
                context.player2.clickCard(context.clone);
                expect(context.clone).toBeCapturedBy(context.discerningVeteran);
                expect(context.clone.getPrintedPower()).toBe(0);
                expect(context.clone.getPrintedHp()).toBe(0);

                // Clone is rescued and enters play again...
                context.player1.clickCard(context.l337);
                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.enfysNest, context.discerningVeteran, context.firstOrderStormtrooper, context.l337]);

                // ...as a copy of First Order Stormtrooper
                context.player1.clickCard(context.firstOrderStormtrooper);
                expect(context.clone.getPrintedPower()).toBe(2);
                expect(context.clone.getPrintedHp()).toBe(1);

                context.moveToNextActionPhase();

                // Clone attacks the opponent's base and triggers its on attack ability from First Order Stormtrooper
                // and it doesn't trigger the on attack ability of Enfys Nest
                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePrompt('Choose a player to target for ability \'Deal 1 indirect damage to a player\'');
                expect(context.player1).toHaveExactPromptButtons(['Deal indirect damage to yourself', 'Deal indirect damage to opponent']);

                context.player1.clickPrompt('Deal indirect damage to opponent');
                expect(context.player2).toHavePrompt('Distribute 1 indirect damage among targets');

                // First Order Stormtrooper is defeated by the indirect damage and triggers its when defeated ability
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.firstOrderStormtrooper, 1],
                ]));
                expect(context.player2).toHavePrompt('Choose a player to target for ability \'Deal 1 indirect damage to a player\'');
                expect(context.player2).toHaveExactPromptButtons(['Deal indirect damage to yourself', 'Deal indirect damage to opponent']);

                // Clone is defeated by the indirect damage and triggers its when defeated ability
                context.player2.clickPrompt('Deal indirect damage to opponent');
                expect(context.player1).toHavePrompt('Distribute 1 indirect damage among targets');

                context.player1.setDistributeIndirectDamagePromptState(new Map([
                    [context.clone, 1],
                ]));
                expect(context.player1).toHavePrompt('Choose a player to target for ability \'Deal 1 indirect damage to a player\'');
                expect(context.player1).toHaveExactPromptButtons(['Deal indirect damage to yourself', 'Deal indirect damage to opponent']);

                // Discerning Veteran receives 1 indirect damage
                context.player1.clickPrompt('Deal indirect damage to opponent');
                expect(context.player2).toHavePrompt('Distribute 1 indirect damage among targets');

                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.discerningVeteran, 1],
                ]));

                expect(context.discerningVeteran.damage).toBe(1);
                expect(context.firstOrderStormtrooper).toBeInZone('discard');
                expect(context.clone).toBeInZone('discard');
                expect(context.clone.getPrintedPower()).toBe(0);
                expect(context.clone.getPrintedHp()).toBe(0);
            });
        });
    });
});
