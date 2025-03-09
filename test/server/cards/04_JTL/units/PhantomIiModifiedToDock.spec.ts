describe('Phantom II, Modified to Dock', function() {
    integration(function(contextRef) {
        describe('Phantom\'s action ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [
                            'phantom-ii#modified-to-dock',
                            'the-ghost#heart-of-the-family',
                            'relentless-firespray'
                        ],
                    },
                    player2: {
                        spaceArena: ['ruthless-raider', 'the-ghost#spectre-home-base'],
                    }
                });
            });

            it('should attach itself to the Ghost as an upgrade', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.phantomIi);
                context.player1.clickPrompt('Attach this as an upgrade to The Ghost');
                expect(context.player1).toBeAbleToSelectExactly([context.theGhostHeartOfTheFamily, context.theGhostSpectreHomeBase]);

                context.player1.clickCard(context.theGhostHeartOfTheFamily);
                expect(context.theGhostHeartOfTheFamily).toHaveExactUpgradeNames(['phantom-ii#modified-to-dock']);
                expect(context.phantomIi.parentCard).toBe(context.theGhostHeartOfTheFamily);

                expect(context.theGhostHeartOfTheFamily.getPower()).toBe(5);
                expect(context.theGhostHeartOfTheFamily.getHp()).toBe(6);

                context.player2.passAction();

                // do an attack to confirm stats work
                context.player1.clickCard(context.theGhostHeartOfTheFamily);
                context.player1.clickCard(context.ruthlessRaider);

                expect(context.ruthlessRaider.damage).toBe(5);
                expect(context.theGhostHeartOfTheFamily.damage).toBe(4);
            });

            it('should attach itself to the opponent\'s Ghost as an upgrade', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.phantomIi);
                context.player1.clickPrompt('Attach this as an upgrade to The Ghost');
                expect(context.player1).toBeAbleToSelectExactly([context.theGhostHeartOfTheFamily, context.theGhostSpectreHomeBase]);

                context.player1.clickCard(context.theGhostSpectreHomeBase);
                expect(context.theGhostSpectreHomeBase).toHaveExactUpgradeNames(['phantom-ii#modified-to-dock']);
                expect(context.phantomIi.parentCard).toBe(context.theGhostSpectreHomeBase);

                expect(context.theGhostSpectreHomeBase.getPower()).toBe(5);
                expect(context.theGhostSpectreHomeBase.getHp()).toBe(5);

                // do an attack to confirm stats work
                context.player2.clickCard(context.theGhostSpectreHomeBase);
                context.player2.clickCard(context.relentlessFirespray);
                context.player2.clickPrompt('Pass');

                expect(context.relentlessFirespray.damage).toBe(5);
                expect(context.theGhostSpectreHomeBase.damage).toBe(4);
            });
        });
    });
});
