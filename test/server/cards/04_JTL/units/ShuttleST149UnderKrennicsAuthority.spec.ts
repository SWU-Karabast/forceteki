describe('Shuttle ST-149 Under Krennics Authority', function() {
    integration(function(contextRef) {
        describe('Shuttle ST-149\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['shuttle-st149#under-krennics-authority', 'entrenched'],
                        groundArena: ['fugitive-wookiee', 'battlefield-marine', { card: 'atst', exhausted: true, upgrades: ['frozen-in-carbonite'] }],
                        spaceArena: [{ card: 'avenger#hunting-star-destroyer', upgrades: ['experience'] }],
                        leader: { card: 'iden-versio#inferno-squad-commander', deployed: true },
                    },
                    player2: {
                        hand: ['electrostaff', 'vanquish'],
                        groundArena: ['wampa', { card: 'hylobon-enforcer', upgrades: ['legal-authority', 'shield'] }],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'finn#this-is-a-rescue', deployed: true },
                    }
                });
            });

            it('should allow, when played, to move a token upgrade to another eligible unit with a different controller', function () {
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
                expect(context.fugitiveWookiee).toHaveExactUpgradeNames(['shield']);

                // Shielded should resolve now
                expect(context.shuttleSt149).toHaveExactUpgradeNames(['shield']);
            });

            it('should allow, when defeated, to move a token upgrade to another eligible unit with a different controller', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.shuttleSt149);
                context.player1.clickPrompt('You may take control of a token upgrade on a unit and attach it to a different eligible unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.experience, context.shield]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                // Shielded should resolve now
                expect(context.shuttleSt149).toHaveExactUpgradeNames(['shield']);

                expect(context.player2).toBeActivePlayer();

                // Defeat the Shuttle
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.shuttleSt149);
                expect(context.shuttleSt149).toBeInZone('discard');
                expect(context.player1).toBeAbleToSelectExactly([context.experience, context.shield]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.experience);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.fugitiveWookiee,
                    context.battlefieldMarine,
                    context.atst,
                    context.idenVersio,
                    context.wampa,
                    context.hylobonEnforcer,
                    context.cartelSpacer,
                    context.finn
                ]);

                context.player1.clickCard(context.idenVersio);
                expect(context.idenVersio).toHaveExactUpgradeNames(['experience']);
            });

            it('should allow, when played, to move the shield token from shielded', function () {
                const { context } = contextRef;

                // We remove the shiled from the Hylobon Enforcer
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.hylobonEnforcer);
                expect(context.hylobonEnforcer).toHaveExactUpgradeNames(['legal-authority']);
                context.player2.passAction();

                // We play the Shuttle but we start with shielded
                context.player1.clickCard(context.shuttleSt149);
                context.player1.clickPrompt('Shielded');
                expect(context.shuttleSt149).toHaveExactUpgradeNames(['shield']);
                const shuttleShield = context.shuttleSt149.upgrades[0];
                expect(context.player1).toBeAbleToSelectExactly([context.experience, shuttleShield]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(shuttleShield);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.fugitiveWookiee,
                    context.battlefieldMarine,
                    context.atst,
                    context.avenger,
                    context.hylobonEnforcer,
                    context.idenVersio,
                    context.wampa,
                    context.cartelSpacer,
                    context.finn
                ]);

                context.player1.clickCard(context.avenger);
                expect(context.avenger).toHaveExactUpgradeNames(['shield', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
