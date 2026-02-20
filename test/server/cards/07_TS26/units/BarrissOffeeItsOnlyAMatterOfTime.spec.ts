describe('Barriss Offee, Its Only A Matter Of Time', function() {
    integration(function(contextRef) {
        describe('Barriss Offee\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['barriss-offee#its-only-a-matter-of-time', 'luke-skywalker#jedi-knight'],
                    },
                    player2: {
                        groundArena: ['atst', 'wampa'],
                    }
                });
            });

            it('should trigger when opponent declares an attack and allow giving Barriss an Experience token (attacking base)', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to Barriss Offee');
                context.player1.clickPrompt('Trigger');

                expect(context.barrissOffeeItsOnlyAMatterOfTime).toHaveExactUpgradeNames(['experience']);
            });

            it('should trigger when opponent declares an attack and allow giving Barriss an Experience token (attacking Barriss Offee)', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.barrissOffee);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeActivePlayer();
                expect(context.barrissOffee.damage).toBe(6);
                expect(context.atst.damage).toBe(6);
            });

            it('should not trigger when controller declares an attack', function () {
                const { context } = contextRef;

                // Player attacks
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.p2Base);

                // Barriss should not trigger
                expect(context.player2).toBeActivePlayer();
                expect(context.barrissOffeeItsOnlyAMatterOfTime).not.toHaveExactUpgradeNames(['experience']);
            });

            it('should trigger multiple times when opponent attacks multiple times in same phase', function () {
                const { context } = contextRef;

                context.player1.passAction();

                // First opponent attack
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);
                context.player1.clickPrompt('Trigger');

                context.player1.passAction();

                // Second opponent attack
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to Barriss Offee');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeActivePlayer();
                expect(context.barrissOffeeItsOnlyAMatterOfTime).toHaveExactUpgradeNames(['experience', 'experience']);
            });
        });
    });
});
