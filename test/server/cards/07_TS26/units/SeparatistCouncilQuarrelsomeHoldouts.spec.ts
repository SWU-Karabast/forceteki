describe('Separatist Council, Quarrelsome Holdouts', function() {
    integration(function(contextRef) {
        describe('Separatist Council\'s when played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['separatist-council#quarrelsome-holdouts'],
                        groundArena: ['clone-trooper', { card: 'battle-droid', exhausted: true }]
                    },
                    player2: {
                        groundArena: ['battle-droid'],
                    }
                });
            });

            it('should choose between 2 options (give 2 experience tokens to a Battle Droid)', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.separatistCouncil);

                expect(context.player1).toHaveEnabledPromptButtons([
                    'Create a Battle Droid token',
                    'Give 2 Experience tokens to a Battle Droid tokens',
                ]);

                context.player1.clickPrompt('Give 2 Experience tokens to a Battle Droid tokens');
                const p1Droid = context.player1.findCardByName('battle-droid');
                const p2Droid = context.player2.findCardByName('battle-droid');
                expect(context.player1).toBeAbleToSelectExactly([p1Droid, p2Droid]);
                context.player1.clickCard(p1Droid);
                expect(p1Droid).toHaveExactUpgradeNames(['experience', 'experience']);
            });

            it('should choose between 2 options (create a battle droid token)', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.separatistCouncil);

                expect(context.player1).toHaveEnabledPromptButtons([
                    'Create a Battle Droid token',
                    'Give 2 Experience tokens to a Battle Droid tokens',
                ]);

                context.player1.clickPrompt('Create a Battle Droid token');
                const p1Droids = context.player1.findCardsByName('battle-droid');
                expect(p1Droids.length).toBe(2);
                for (const droid of p1Droids) {
                    expect(droid.exhausted).toBeTrue();
                }
            });
        });

        describe('Separatist Council\'s on attack ability', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['separatist-council#quarrelsome-holdouts'],
                    },
                });
            });

            it('Separatist Council choose between 2 options (create a battle droid token)', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.separatistCouncil);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveEnabledPromptButtons([
                    'Create a Battle Droid token',
                    '(No effect) Give 2 Experience tokens to a Battle Droid tokens',
                ]);

                context.player1.clickPrompt('Create a Battle Droid token');
                expect(context.player2).toBeActivePlayer();
                const p1Droids = context.player1.findCardsByName('battle-droid');
                expect(p1Droids.length).toBe(1);
                expect(p1Droids[0].exhausted).toBeTrue();
            });

            it('Separatist Council choose between 2 options (give 2 experience tokens to a Battle Droid but no Battle Droid in game)', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.separatistCouncil);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveEnabledPromptButtons([
                    'Create a Battle Droid token',
                    '(No effect) Give 2 Experience tokens to a Battle Droid tokens',
                ]);

                context.player1.clickPrompt('(No effect) Give 2 Experience tokens to a Battle Droid tokens');
                expect(context.player2).toBeActivePlayer();
                expect(context.separatistCouncil).toHaveExactUpgradeNames([]);
            });
        });
    });
});
