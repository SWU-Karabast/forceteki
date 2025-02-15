
describe('Sabine\'s Masterpiece, Crazy Colorful', function() {
    integration(function(contextRef) {
        it('Sabine\'s Masterpiece, Crazy Colorful\'s ability should heal 2 damage from a base if you control a vigilance unit, give an Experience token to a unit if you control a command unit, deal 1 damage to a unit or base if you control an aggression unit and/or exhaust or ready a resource if you control a cunning unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['501st-liberator', 'clone-dive-trooper', 'desperado-freighter'],
                    groundArena: ['death-trooper'],
                    spaceArena: ['sabines-masterpiece#crazy-colorful'],
                    base: { card: 'chopper-base', damage: 2 }
                }
            });

            const { context } = contextRef;

            // Verify that the base has 2 damage
            expect(context.p1Base.damage).toBe(2);

            // Only Vigilance unit
            context.player1.clickCard(context.sabinesMasterpieceCrazyColorful);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.p1Base]);
            context.player1.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(0);

            // Play a Command unit
            context.player2.passAction();
            context.player1.clickCard(context._501stLiberator);
            context.moveToNextActionPhase();

            // Vigilance and Command unit
            context.player1.clickCard(context.sabinesMasterpieceCrazyColorful);
            context.player1.clickCard(context.p2Base);

            // Controls a vigilance unit healing 2 damage from a base
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.p1Base]);
            context.player1.clickCard(context.p1Base);

            // Controls a command unit giving an Experience token to a unit
            expect(context.player1).toBeAbleToSelectExactly([context.deathTrooper, context._501stLiberator, context.sabinesMasterpieceCrazyColorful]);
            context.player1.clickCard(context.deathTrooper);
            expect(context.deathTrooper).toHaveExactUpgradeNames(['experience']);

            // Plays an Aggression Unit
            context.player2.passAction();
            context.player1.clickCard(context.desperadoFreighter);
            context.moveToNextActionPhase();

            // Attack with Sabine's Masterpiece, Crazy Colorful with a Vigilance, Command and Aggression unit
            context.player1.clickCard(context.sabinesMasterpieceCrazyColorful);
            context.player1.clickCard(context.p2Base);

            // Controls a vigilance unit healing 2 damage from a base
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.p1Base]);
            context.player1.clickCard(context.p1Base);

            // Controls a command unit giving an Experience token to a unit
            expect(context.player1).toBeAbleToSelectExactly([context.deathTrooper, context._501stLiberator, context.desperadoFreighter, context.sabinesMasterpieceCrazyColorful]);
            context.player1.clickCard(context.deathTrooper);

            // Controls an aggression unit dealing 1 damage to a unit or base
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.p1Base, context._501stLiberator, context.desperadoFreighter, context.deathTrooper, context.sabinesMasterpieceCrazyColorful]);
            context.player1.clickCard(context._501stLiberator);
            expect(context._501stLiberator.damage).toBe(1);

            // Play Cunning unit
            context.player2.passAction();
            context.player1.clickCard(context.cloneDiveTrooper);
            context.moveToNextActionPhase();

            // Attack with Sabine's Masterpiece, Crazy Colorful
            context.player1.clickCard(context.sabinesMasterpieceCrazyColorful);
            context.player1.clickCard(context.p2Base);

            // Controls a vigilance unit healing 2 damage from a base
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.p1Base]);
            context.player1.clickCard(context.p1Base);

            // Controls a command unit giving an Experience token to a unit
            expect(context.player1).toBeAbleToSelectExactly([context.deathTrooper, context._501stLiberator, context.cloneDiveTrooper, context.desperadoFreighter, context.sabinesMasterpieceCrazyColorful]);
            context.player1.clickCard(context.deathTrooper);

            // Controls an aggression unit dealing 1 damage to a unit or base
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.p1Base, context._501stLiberator, context.cloneDiveTrooper, context.desperadoFreighter, context.deathTrooper, context.sabinesMasterpieceCrazyColorful]);
            context.player1.clickCard(context._501stLiberator);
            expect(context._501stLiberator.damage).toBe(2);

            // Controls a cunning unit exhausting or readying a resource
            expect(context.player1).toHaveEnabledPromptButtons([
                'Exhaust a resource',
                'Ready a resource',
            ]);
            context.player1.clickPrompt('Exhaust a resource');

            // Assert
            expect(context.p1Base.damage).toBe(0);
            expect(context.player2.exhaustedResourceCount).toBe(1);
            expect(context.deathTrooper).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);

            // Move to next action phase and board state setup
            context.setDamage(context.p1Base, 2);
            context.moveToNextActionPhase();
            expect(context.p1Base.damage).toBe(2);
            context.player1.exhaustResources(2);
            const exhaustedResourcesBeforeAbility = context.player1.exhaustedResourceCount;
            expect(exhaustedResourcesBeforeAbility).toBe(2);

            // Attack with Sabine's Masterpiece, Crazy Colorful
            context.player1.clickCard(context.sabinesMasterpieceCrazyColorful);
            context.player1.clickCard(context.p2Base);

            // Controls a vigilance unit healing 2 damage from a base
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.p1Base]);
            context.player1.clickCard(context.p1Base);

            // Controls a command unit giving an Experience token to a unit
            expect(context.player1).toBeAbleToSelectExactly([context.deathTrooper, context._501stLiberator, context.cloneDiveTrooper, context.desperadoFreighter, context.sabinesMasterpieceCrazyColorful]);
            context.player1.clickCard(context.deathTrooper);

            // Controls an aggression unit dealing 1 damage to a unit or base
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.p1Base, context._501stLiberator, context.cloneDiveTrooper, context.desperadoFreighter, context.deathTrooper, context.sabinesMasterpieceCrazyColorful]);
            context.player1.clickCard(context._501stLiberator);

            // Controls a cunning unit exhausting or readying a resource
            expect(context.player1).toHaveEnabledPromptButtons([
                'Exhaust a resource',
                'Ready a resource',
            ]);
            context.player1.clickPrompt('Ready a resource');

            // Assert
            expect(context.p1Base.damage).toBe(0);
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourcesBeforeAbility - 1);
        });
    });
});
