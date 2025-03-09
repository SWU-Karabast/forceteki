describe('Phantom II, Modified to Dock', function() {
    integration(function(contextRef) {
        describe('Phantom\'s action ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['phantom-ii#modified-to-dock', 'the-ghost#heart-of-the-family'],
                    },
                    player2: {
                        spaceArena: ['ruthless-raider'],
                    }
                });
            });

            it('should attach itself to the Ghost as an upgrade', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.phantomIi);
                context.player1.clickPrompt('Attach this as an upgrade to The Ghost');
                expect(context.player1).toBeAbleToSelectExactly(context.theGhost);

                context.player1.clickCard(context.theGhost);
                expect(context.theGhost).toHaveExactUpgradeNames(['phantom-ii#modified-to-dock']);
                expect(context.phantomIi.parentCard).toBe(context.theGhost);

                expect(context.theGhost.getPower()).toBe(5);
                expect(context.theGhost.getHp()).toBe(6);

                context.player2.passAction();

                // do an attack to confirm stats work
                context.player1.clickCard(context.theGhost);
                context.player1.clickCard(context.ruthlessRaider);

                expect(context.ruthlessRaider.damage).toBe(5);
                expect(context.theGhost.damage).toBe(4);
            });
        });
    });
});
