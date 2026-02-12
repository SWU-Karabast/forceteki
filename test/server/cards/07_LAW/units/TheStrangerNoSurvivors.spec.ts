describe('The Stranger, No Survivors', function() {
    integration(function(contextRef) {
        describe('The Stranger\'s "defender deals damage first" ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['shoot-first'],
                        groundArena: ['the-stranger#no-survivors'],
                    },
                    player2: {
                        groundArena: [
                            'battlefield-marine',
                            'consular-security-force',
                            'death-star-stormtrooper'
                        ],
                    }
                });
            });

            const abilityPrompt = 'Choose how damage is dealt for this attack';

            it('should not prompt when attacking a base', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.theStranger);
                context.player1.clickCard(context.p2Base);

                // No prompt should appear, damage is dealt normally
                expect(context.player1).not.toHavePrompt(abilityPrompt);
                expect(context.p2Base.damage).toBe(1);
                expect(context.theStranger.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should prompt when attacking a unit, and deal damage normally when that option is chosen', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.theStranger);
                context.player1.clickCard(context.battlefieldMarine);

                // Prompt should appear for the choice
                expect(context.player1).toHavePrompt(abilityPrompt);
                context.player1.clickPrompt('Deal damage normally');

                // Damage dealt simultaneously - both units should have damage
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.theStranger.damage).toBe(3);
            });

            it('should allow defender to deal damage first, defeating the defender after The Stranger gains power from Grit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.theStranger);
                context.player1.clickCard(context.battlefieldMarine);

                // Prompt should appear for the choice
                expect(context.player1).toHavePrompt(abilityPrompt);
                context.player1.clickPrompt('Defender deals damage first');

                // Battlefield Marine is defeated due to taking 4 damage
                expect(context.theStranger.damage).toBe(3);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.getChatLogs(3)).toContain('player1 uses The Stranger to deal combat damage after Battlefield Marine for this attack');
            });

            it('should allow defender to deal damage first, but the defender survives', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.theStranger);
                context.player1.clickCard(context.consularSecurityForce);

                // Prompt should appear for the choice
                expect(context.player1).toHavePrompt(abilityPrompt);
                context.player1.clickPrompt('Defender deals damage first');

                // The Stranger takes 3 damage first, then attacks with Grit bonus
                expect(context.theStranger.damage).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(4);
            });

            it('should not prompt the player when The Stranger is already dealing damage first', function() {
                const { context } = contextRef;

                // Give The Stranger the "deals combat damage first" effect from Shoot First
                context.player1.clickCard(context.shootFirst);
                context.player1.clickCard(context.theStranger);
                context.player1.clickCard(context.deathStarStormtrooper);

                // Prompt should not appear since The Stranger is already dealing damage first
                expect(context.player1).not.toHavePrompt(abilityPrompt);

                // The Stranger should defeat the Death Star Stormtrooper without taking damage
                expect(context.deathStarStormtrooper).toBeInZone('discard');
                expect(context.theStranger.damage).toBe(0);
            });
        });
    });
});
