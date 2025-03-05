
describe('Sabine\'s Masterpiece, Crazy Colorful', function() {
    integration(function(contextRef) {
        describe('Sabine\'s Masterpiece\'s on attack ability', function() {
            it('should heal 2 damage from a base if you control a vigilance unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['death-trooper'],
                        spaceArena: ['sabines-masterpiece#crazy-colorful'],
                        base: { card: 'chopper-base', damage: 2 }
                    }
                });

                const { context } = contextRef;

                expect(context.p1Base.damage).toBe(2);

                context.player1.clickCard(context.sabinesMasterpiece);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(0);
            });

            it('should give an Experience token to a unit if you control a command unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['501st-liberator'],
                        spaceArena: ['sabines-masterpiece#crazy-colorful'],
                    },
                    player2: {
                        groundArena: ['death-trooper'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sabinesMasterpiece);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context._501stLiberator, context.sabinesMasterpiece, context.deathTrooper]);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.sabinesMasterpiece);

                expect(context.p2Base.damage).toBe(4);
                expect(context.sabinesMasterpiece).toHaveExactUpgradeNames(['experience']);
            });

            it('should deal 1 damage to a unit or base if you control an aggression unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['sabines-masterpiece#crazy-colorful', 'desperado-freighter'],
                    },
                    player2: {
                        groundArena: ['death-trooper'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sabinesMasterpiece);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.desperadoFreighter, context.sabinesMasterpiece, context.deathTrooper, context.p1Base, context.p2Base]);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);
            });

            it('should exhaust a resource if you control a cunning unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['clone-dive-trooper'],
                        spaceArena: ['sabines-masterpiece#crazy-colorful'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sabinesMasterpiece);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactPromptButtons(['Exhaust a resource', 'Ready a resource']);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickPrompt('Exhaust a resource');

                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);

                const opponentExhaustedResourceCount = context.player2.exhaustedResourceCount;
                context.player1.clickPrompt('Opponent');

                expect(context.player2.exhaustedResourceCount).toBe(opponentExhaustedResourceCount + 1);
            });

            it('should ready a resource if you control a cunning unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['clone-dive-trooper'],
                        spaceArena: ['sabines-masterpiece#crazy-colorful'],
                    }
                });

                const { context } = contextRef;

                context.player1.exhaustResources(5);

                context.player1.clickCard(context.sabinesMasterpiece);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactPromptButtons(['Exhaust a resource', 'Ready a resource']);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickPrompt('Ready a resource');

                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);

                const readyResourceCount = context.player1.readyResourceCount;
                context.player1.clickPrompt('You');

                expect(context.player1.readyResourceCount).toBe(readyResourceCount + 1);
            });

            it('should trigger all abilities if you control a unit for each aspect', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['clone-dive-trooper', '501st-liberator', 'death-trooper'],
                        spaceArena: ['sabines-masterpiece#crazy-colorful', 'desperado-freighter'],
                        base: { card: 'chopper-base', damage: 2 },
                    }
                });

                const { context } = contextRef;

                expect(context.p1Base.damage).toBe(2);

                context.player1.clickCard(context.sabinesMasterpiece);
                context.player1.clickCard(context.p2Base);

                // Vigilance unit ability
                expect(context.player1).toHavePrompt('Choose a base to heal 2 damage from');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.p1Base);

                // Command unit ability
                expect(context.player1).toHavePrompt('Choose a unit to give an Experience token to');
                expect(context.player1).toBeAbleToSelectExactly([context._501stLiberator, context.desperadoFreighter, context.cloneDiveTrooper, context.sabinesMasterpiece, context.deathTrooper]);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.sabinesMasterpiece);

                // Aggression unit ability
                expect(context.player1).toHavePrompt('Choose a unit or base to deal 1 damage to');
                expect(context.player1).toBeAbleToSelectExactly([context._501stLiberator, context.desperadoFreighter, context.sabinesMasterpiece, context.cloneDiveTrooper, context.deathTrooper, context.p1Base, context.p2Base]);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.p2Base);

                // Cunning unit ability
                expect(context.player1).toHaveExactPromptButtons(['Exhaust a resource', 'Ready a resource']);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickPrompt('Exhaust a resource');

                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);

                const opponentExhaustedResourceCount = context.player2.exhaustedResourceCount;
                context.player1.clickPrompt('Opponent');

                expect(context.player2.exhaustedResourceCount).toBe(opponentExhaustedResourceCount + 1);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(5);
                expect(context.sabinesMasterpiece).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
