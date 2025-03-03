describe('Shuttle ST-149 Under Krennics Authority', function() {
    integration(function(contextRef) {
        describe('Shuttle ST-149\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['shuttle-st149#under-krennics-authority', 'entrenched', 'vanquish'],
                        groundArena: ['fugitive-wookiee', 'battlefield-marine', { card: 'atst', exhausted: true, upgrades: ['frozen-in-carbonite'] }],
                        spaceArena: [{ card: 'avenger#hunting-star-destroyer', upgrades: ['experience'] }],
                        leader: { card: 'iden-versio#inferno-squad-commander', deployed: true },
                    },
                    player2: {
                        hand: ['electrostaff'],
                        groundArena: ['wampa', { card: 'hylobon-enforcer', upgrades: ['legal-authority', 'shield'] }],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'finn#this-is-a-rescue', deployed: true },
                    }
                });
            });

            it('should allow to move a token upgrade to another eligible unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.shuttleSt149);
                context.player1.clickPrompt('You may take control of a token upgrade on a unit and attach it to a different eligible unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.experience, context.shield]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.shield);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.fugitiveWookiee,
                    context.battlefieldMarine,
                    context.atst,
                    context.avenger,
                    context.idenVersio,
                    context.shuttleSt149,
                    context.wampa,
                    context.cartelSpacer,
                    context.finn
                ]);

                context.player1.clickCard(context.fugitiveWookiee);

                expect(context.player2).toBeActivePlayer();
                expect(context.fugitiveWookiee.exhausted).toBe(false);
                expect(context.fugitiveWookiee).toHaveExactUpgradeNames(['shield']);

                // Shielded should resolve now
                expect(context.shuttleSt149).toHaveExactUpgradeNames(['shield']);
            });
        });
    });
});
