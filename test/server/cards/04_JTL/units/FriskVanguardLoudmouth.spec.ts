describe('Frisk, Vanguard Loudmouth', function() {
    integration(function(contextRef) {
        describe('Frisk\'s piloting ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['frisk#vanguard-loudmouth'],
                        groundArena: [{ card: 'atst', upgrades: ['experience'] }],
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['frozen-in-carbonite'] }],
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['resilient'] }],
                        spaceArena: [{ card: 'cartel-spacer', upgrades: ['wingman-victor-two#mauler-mithel'] }],
                    }
                });
            });

            it('should allow to defeat an upgrade that costs 2 when played as a pilot', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.frisk);
                context.player1.clickPrompt('Play Frisk with Piloting');
                context.player1.clickCard(context.atst);

                expect(context.player1).toBeAbleToSelectExactly([context.frisk, context.experience, context.resilient, context.wingmanVictorTwo]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wingmanVictorTwo);

                expect(context.cartelSpacer).toHaveExactUpgradeNames([]);
                expect(context.wingmanVictorTwo).toBeInZone('discard');
            });

            it('should allow to defeat an upgrade that costs 1 when played as a pilot', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.frisk);
                context.player1.clickPrompt('Play Frisk with Piloting');
                context.player1.clickCard(context.atst);

                expect(context.player1).toBeAbleToSelectExactly([context.frisk, context.experience, context.resilient, context.wingmanVictorTwo]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.resilient);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.resilient).toBeInZone('discard');
            });

            it('should allow to defeat an upgrade that costs 0 when played as a pilot', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.frisk);
                context.player1.clickPrompt('Play Frisk with Piloting');
                context.player1.clickCard(context.atst);

                expect(context.player1).toBeAbleToSelectExactly([context.frisk, context.experience, context.resilient, context.wingmanVictorTwo]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.experience);

                expect(context.atst).toHaveExactUpgradeNames(['frisk#vanguard-loudmouth']);
            });

            it('should not allow to defeat an upgrade that costs 2 or less when played as a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.frisk);
                context.player1.clickPrompt('Play Frisk');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});