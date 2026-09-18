describe('General Grievous, Scuttling to Safety', function() {
    integration(function(contextRef) {
        describe('General Grievous, Scuttling to Safety\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-grievous#scuttling-to-safety', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['change-of-heart'],
                        groundArena: ['rebel-pathfinder', { card: 'luke-skywalker#jedi-knight', upgrades: ['vambrace-flamethrower'] }],
                        hasInitiative: true
                    }
                });
            });

            it('should return him to hand when attacked', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.rebelPathfinder);
                context.player2.clickCard(context.generalGrievousScuttlingToSafety);

                context.player2.clickPrompt('You');

                expect(context.rebelPathfinder.damage).toBe(0);
                expect(context.generalGrievousScuttlingToSafety).toBeInZone('hand');
                expect(context.player1.hand).toContain(context.generalGrievousScuttlingToSafety);
            });

            it('should return him to his owner\'s hand after he changes control', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.generalGrievousScuttlingToSafety);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.generalGrievousScuttlingToSafety);

                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.generalGrievousScuttlingToSafety).toBeInZone('hand');
                expect(context.player1.hand).toContain(context.generalGrievousScuttlingToSafety);
            });

            it('should not return him to hand if he is attacking', function () {
                const { context } = contextRef;

                context.player2.clickPrompt('Pass');

                context.player1.clickCard(context.generalGrievousScuttlingToSafety);
                context.player1.clickCard(context.rebelPathfinder);

                expect(context.generalGrievousScuttlingToSafety.damage).toBe(2);
                expect(context.rebelPathfinder).toBeInZone('discard');
            });

            it('should not return a friendly unit to hand when they are attacked', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.rebelPathfinder);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.rebelPathfinder).toBeInZone('discard');
            });

            it('should die from on attack triggers', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.lukeSkywalkerJediKnight);
                context.player2.clickCard(context.generalGrievousScuttlingToSafety);

                context.player2.clickPrompt('You');
                context.player2.clickPrompt('(no effect) Restore 3');
                context.player2.setDistributeDamagePromptState(new Map([
                    [context.generalGrievousScuttlingToSafety, 3],
                ]));

                expect(context.generalGrievousScuttlingToSafety).toBeInZone('discard');
            });

            // Ruling 2025-11-25 (CR 6.3.2.B): when Grievous returns himself to hand before damage, an
            // attacker with Overwhelm still deals its combat damage to the enemy base (even though
            // Grievous was not defeated, since he is no longer in play).
            xit('lets an attacker with Overwhelm damage the base when Grievous returns himself to hand', function () {
                // An enemy unit with Overwhelm attacks Grievous. His "when attacked" returns him to hand
                // before damage. Because the defender left play and the attacker has Overwhelm, the
                // attacker's full combat damage is dealt to the defending base.
            });
        });
    });
});