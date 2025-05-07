describe('HK-47, Exclamation: Die Meatbag', function() {
    const prompt = 'Deal 1 damage to its controller\'s base: ';
    integration(function(contextRef) {
        describe('HK-47\'s triggered ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'traitorous',
                            'takedown',
                            'superlaser-blast'
                        ],
                        groundArena: ['hk47#exclamation-die-meatbag'],
                        spaceArena: ['scimitar#sith-infiltrator']
                    },
                    player2: {
                        hand: [
                            'change-of-heart',
                            'vanquish'
                        ],
                        groundArena: [
                            'contracted-hunter',
                            'death-star-stormtrooper',
                            'freelance-assassin',
                        ],
                        spaceArena: [
                            'kylos-tie-silencer#ruthlessly-efficient'
                        ],
                    }
                });
            });

            it('should deal 1 damage to the opponent\'s base when an enemy unit is defeated by combat damage', function () {
                const { context } = contextRef;

                // Attack and defeat an enemy unit
                context.player1.clickCard(context.hk47);
                context.player1.clickCard(context.deathStarStormtrooper);

                // Check that the unit was defeated and the opponent's base took damage
                expect(context.deathStarStormtrooper).toBeInZone('discard');
                expect(context.player2.base.damage).toBe(1);
            });

            it('should deal 1 damage to the opponent\'s base when an enemy unit is defeated during the regroup phase', function () {
                const { context } = contextRef;

                // Move to regroup phase, defeating Contracted Hunter
                context.moveToRegroupPhase();

                // Check that the unit was defeated and the opponent's base took damage
                expect(context.contractedHunter).toBeInZone('discard');
                expect(context.player2.base.damage).toBe(1);
            });

            it('should not deal damage when a friendly stolen unit is defeated', function () {
                const { context } = contextRef;

                // Play Traitorous to steal an enemy unit
                context.player1.clickCard(context.traitorous);
                context.player1.clickCard(context.kylosTieSilencer);

                // Opponent defeats the stolen unit
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.kylosTieSilencer);

                // Check that the unit was defeated but the opponent's base did not take damage
                expect(context.kylosTieSilencer).toBeInZone('discard', context.player2);
                expect(context.player2.base.damage).toBe(0);
            });

            it('should deal 1 damage when an enemy stolen unit is defeated', function () {
                const { context } = contextRef;
                context.player1.passAction();

                // Player 2 plays Change of Heart to steal a unit
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.scimitar);

                // Defeat the stolen unit
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.scimitar);

                // Check that the unit was defeated and the opponent's base took damage
                expect(context.scimitar).toBeInZone('discard', context.player1);
                expect(context.player2.base.damage).toBe(1);
            });

            it('should deal 1 damage when an enemy unit is defeated by a card effect', function () {
                const { context } = contextRef;

                // Use Vanquish to defeat an enemy unit
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.freelanceAssassin);

                // Check that the unit was defeated and the opponent's base took damage
                expect(context.freelanceAssassin).toBeInZone('discard');
                expect(context.player2.base.damage).toBe(1);
            });

            it('should deal 1 damage for each enemy unit defeated when multiple are defeated simultaneously', function () {
                const { context } = contextRef;

                // Defeat multiple enemy units
                context.player1.clickCard(context.superlaserBlast);

                // Choose resolution order
                context.player1.clickPrompt(prompt + context.contractedHunter.name);
                context.player1.clickPrompt(prompt + context.freelanceAssassin.name);
                context.player1.clickPrompt(prompt + context.deathStarStormtrooper.name);

                // Check that all 4 units were defeated and the opponent's base took 4 damage
                expect(context.player2.discard.length).toBe(4);
                expect(context.player2.base.damage).toBe(4);
            });

            it('should deal 1 damage even if HK-47 is defeated', function () {
                const { context } = contextRef;

                // Attack and defeat an enemy unit
                context.player1.clickCard(context.hk47);
                context.player1.clickCard(context.freelanceAssassin);

                // Check that both units were defeated and the opponent's base took damage
                expect(context.hk47).toBeInZone('discard', context.player1);
                expect(context.freelanceAssassin).toBeInZone('discard', context.player2);
                expect(context.player2.base.damage).toBe(1);
            });

            // TODO: Add case with base damage prevention effect after Close the Shield Gate is implemented
        });
    });
});