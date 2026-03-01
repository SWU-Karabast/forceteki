describe('Fett\'s Firespray, In Pursuit', function() {
    integration(function(contextRef) {
        describe('Fett\'s Firespray on attack ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    attackRulesVersion: 'cr7',
                    player1: {
                        hand: ['heroic-sacrifice'],
                        spaceArena: ['fetts-firespray#in-pursuit'],
                    },
                    player2: {
                        spaceArena: ['cartel-spacer', 'coronet#stately-vessel', { card: 'longbeam-cruiser', damage: 2 }],
                    }
                });
            });

            it('creates a Credit token if the defending unit was defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fettsFirespray);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.fettsFirespray).toBeInZone('spaceArena');
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.player1.credits).toBe(1);
                expect(context.player2.credits).toBe(0);
            });

            it('does not create a Credit token if the defending unit is not defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fettsFirespray);
                context.player1.clickCard(context.coronet);

                expect(context.fettsFirespray).toBeInZone('spaceArena');
                expect(context.coronet).toBeInZone('spaceArena');
                expect(context.player1.credits).toBe(0);
                expect(context.player2.credits).toBe(0);
            });

            it('creates a Credit token if the defending unit was defeated even if it is defeated by an ability first', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.heroicSacrifice);
                context.player1.clickCard(context.fettsFirespray);
                context.player1.clickCard(context.coronet);

                expect(context.player1).toHaveExactPromptButtons([
                    'When this unit deals combat damage: Defeat it.',
                    'If the defending unit was defeated, create a Credit token'
                ]);

                context.player1.clickPrompt('When this unit deals combat damage: Defeat it.');

                expect(context.fettsFirespray).toBeInZone('discard');
                expect(context.player1.credits).toBe(1);
                expect(context.player2.credits).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('creates a Credit token if the defending unit was defeated even if it is defeated by combat damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fettsFirespray);
                context.player1.clickCard(context.longbeamCruiser);

                expect(context.fettsFirespray).toBeInZone('discard');
                expect(context.longbeamCruiser).toBeInZone('discard');
                expect(context.player1.credits).toBe(1);
                expect(context.player2.credits).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
