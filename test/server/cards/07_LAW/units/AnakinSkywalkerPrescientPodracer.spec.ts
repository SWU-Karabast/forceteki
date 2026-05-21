describe('Anakin Skywalker, Prescient Podracer', function() {
    integration(function(contextRef) {
        describe('Anakin Skywalker\'s triggered ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'chopper-base', damage: 5 },
                        groundArena: ['anakin-skywalker#prescient-podracer', 'anakins-podracer#so-wizard'],
                        hand: ['traitorous'],
                    },
                    player2: {
                        base: { card: 'dagobah-swamp', damage: 5 },
                        groundArena: ['battlefield-marine', 'wampa'],
                    }
                });
            });

            it('should allow returning this unit to hand and heal 2 damage from base when Anakin attacks first and survives', function () {
                const { context } = contextRef;

                // Anakin attacks Battlefield Marine and survives
                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.battlefieldMarine);

                // Prompt to return Anakin to hand
                expect(context.player1).toHavePassAbilityPrompt('Return Anakin Skywalker to your hand to heal 2 damage from your base');
                context.player1.clickPrompt('Trigger');

                // Anakin should be in hand, and P1 base should heal 2
                expect(context.anakinSkywalker).toBeInZone('hand', context.player1);
                expect(context.p1Base.damage).toBe(3);
                expect(context.p2Base.damage).toBe(5); // unchanged
            });

            it('should allow returning another friendly unit to hand and heal 2 damage from base when it attacks first and survives', function () {
                const { context } = contextRef;

                // Anakin's Podracer attacks Battlefield Marine and survives
                context.player1.clickCard(context.anakinsPodracer);
                context.player1.clickCard(context.battlefieldMarine);

                // Prompt to return Anakin's Podracer to hand
                expect(context.player1).toHavePassAbilityPrompt('Return Anakin\'s Podracer to your hand to heal 2 damage from your base');
                context.player1.clickPrompt('Trigger');

                // Anakin's Podracer should be in hand, and P1 base should heal 2
                expect(context.anakinsPodracer).toBeInZone('hand', context.player1);
                expect(context.p1Base.damage).toBe(3);
                expect(context.p2Base.damage).toBe(5); // unchanged
            });

            it('should allow player to pass the ability when a friendly unit attacks first and survives', function () {
                const { context } = contextRef;

                // Anakin's Podracer attacks Battlefield Marine and survives
                context.player1.clickCard(context.anakinsPodracer);
                context.player1.clickCard(context.battlefieldMarine);

                // Prompt to return Anakin's Podracer to hand
                expect(context.player1).toHavePassAbilityPrompt('Return Anakin\'s Podracer to your hand to heal 2 damage from your base');
                context.player1.clickPrompt('Pass');

                // Anakin's Podracer is still in play, no change to base damage
                expect(context.anakinsPodracer).toBeInZone('groundArena', context.player1);
                expect(context.p1Base.damage).toBe(5);
                expect(context.p2Base.damage).toBe(5);
            });

            it('should not trigger the ability when a friendly unit attacks first but does not survive', function () {
                const { context } = contextRef;

                // Anakin's Podracer attacks Wampa, and is defeated
                context.player1.clickCard(context.anakinsPodracer);
                context.player1.clickCard(context.wampa);

                // No prompt should appear because the attacker was defeated
                expect(context.player1).not.toHavePassAbilityPrompt('Return Anakin\'s Podracer to your hand to heal 2 damage from your base');
                expect(context.player2).toBeActivePlayer();

                // Anakin's Podracer should be defeated, no change to base damage
                expect(context.anakinsPodracer).toBeInZone('discard', context.player1);
                expect(context.p1Base.damage).toBe(5);
                expect(context.p2Base.damage).toBe(5);
            });

            it('should not trigger the ability when a friendly unit attacks but another unit attacked first', function () {
                const { context } = contextRef;

                // P1 passes
                context.player1.passAction();

                // P2 attacks with Battlefield Marine first
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);

                // No prompt for enemy attacks
                expect(context.player2).not.toHavePassAbilityPrompt('Return Battlefield Marine to your hand to heal 2 damage from your base');

                // Now P1 attacks with Anakin, and it survives
                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.battlefieldMarine);

                // No prompt should appear because another unit attacked this phase
                expect(context.player1).not.toHavePassAbilityPrompt('Return Anakin Skywalker to your hand to heal 2 damage from your base');
                expect(context.player2).toBeActivePlayer();

                // Anakin Skywalker is still in play, no heal from base
                expect(context.anakinSkywalker).toBeInZone('groundArena', context.player1);
                expect(context.p1Base.damage).toBe(8); // took damage from Battlefield Marine's attack
                expect(context.p2Base.damage).toBe(5); // unchanged
            });

            it('should return a stolen enemy unit to the opponent\'s hand when it attacks first and survives, and P1 heals 2', function () {
                const { context } = contextRef;

                // P1 plays Traitorous on P2's Battlefield Marine
                context.player1.clickCard(context.traitorous);
                context.player1.clickCard(context.battlefieldMarine);

                // Battlefield Marine is now controlled by P1
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);

                // P2 passes
                context.player2.passAction();

                // P1 attacks with the stolen Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Prompt to return Battlefield Marine - but to opponent's hand since they own it
                expect(context.player1).toHavePassAbilityPrompt('Return Battlefield Marine to player2\'s hand to heal 2 damage from your base');
                context.player1.clickPrompt('Trigger');

                // Battlefield Marine should be in P2's hand (owner's hand), P1 base heals 2
                expect(context.battlefieldMarine).toBeInZone('hand', context.player2);
                expect(context.p1Base.damage).toBe(3); // healed 2
                expect(context.p2Base.damage).toBe(8); // took damage from Battlefield Marine's attack
            });
        });
    });
});
