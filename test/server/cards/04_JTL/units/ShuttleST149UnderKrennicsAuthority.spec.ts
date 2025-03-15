describe('Shuttle ST-149 Under Krennics Authority', function() {
    integration(function(contextRef) {
        describe('Shuttle ST-149\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['shuttle-st149#under-krennics-authority', 'entrenched'],
                        groundArena: ['fugitive-wookiee', 'battlefield-marine', { card: 'atst', exhausted: true, upgrades: ['frozen-in-carbonite'] }],
                        spaceArena: [{ card: 'avenger#hunting-star-destroyer', upgrades: ['shield'] }],
                        leader: { card: 'finn#this-is-a-rescue', deployed: true },
                    },
                    player2: {
                        hand: ['electrostaff', 'vanquish'],
                        groundArena: ['wampa', { card: 'hylobon-enforcer', upgrades: ['legal-authority', 'experience'] }],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'iden-versio#inferno-squad-commander', deployed: true },
                    }
                });
            });

            it('should allow, when played, to move a token upgrade to another eligible unit with a different controller', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.shuttleSt149);
                context.player1.clickPrompt('Take control of a token upgrade on a unit and attach it to a different eligible unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.experience, context.shield]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.experience);
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

                context.player1.clickCard(context.avenger);

                expect(context.player2).toBeActivePlayer();
                expect(context.avenger).toHaveExactUpgradeNames(['shield', 'experience']);

                // Shielded should resolve now
                expect(context.shuttleSt149).toHaveExactUpgradeNames(['shield']);

                // We test the controller with of the shield with Finn
                context.player2.passAction();
                context.player1.clickCard(context.finn);
                context.player1.clickCard(context.p2Base);
                const avengerShield = context.avenger.upgrades[0];
                const shuttleShield = context.shuttleSt149.upgrades[0];
                expect(context.player1).toBeAbleToSelectExactly([
                    context.experience,
                    avengerShield,
                    shuttleShield,
                    context.frozenInCarbonite
                ]);
                context.player1.clickCard(context.experience);
                expect(context.avenger).toHaveExactUpgradeNames(['shield', 'shield']);
            });

            it('should allow, when defeated, to move a token upgrade to another eligible unit with a different controller', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.shuttleSt149);
                context.player1.clickPrompt('Take control of a token upgrade on a unit and attach it to a different eligible unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.experience, context.shield]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                // Shielded should resolve now
                expect(context.shuttleSt149).toHaveExactUpgradeNames(['shield']);

                expect(context.player2).toBeActivePlayer();

                // Defeat the Shuttle
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.shuttleSt149);
                context.player2.clickPrompt('You');
                expect(context.shuttleSt149).toBeInZone('discard');
                const avengerShield = context.avenger.upgrades[0];
                expect(context.player1).toBeAbleToSelectExactly([context.experience, avengerShield]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(avengerShield);
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
                expect(context.idenVersio).toHaveExactUpgradeNames(['shield']);

                // The shild on idenVersion should remain controlled by player1
                // So Finn should be able to defeat it
                context.player1.clickCard(context.finn);
                context.player1.clickCard(context.p2Base);
                const idenShield = context.idenVersio.upgrades[0];
                expect(context.player1).toBeAbleToSelectExactly([idenShield, context.frozenInCarbonite]);
                context.player1.clickCard(idenShield);
                expect(context.idenVersio).toHaveExactUpgradeNames(['shield']);
            });

            it('should allow, when played, to move the shield token from shielded', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.shuttleSt149);
                context.player1.clickPrompt('Shielded');
                expect(context.shuttleSt149).toHaveExactUpgradeNames(['shield']);
                const shuttleShield = context.shuttleSt149.upgrades[0];
                const avengerShield = context.avenger.upgrades[0];
                expect(context.player1).toBeAbleToSelectExactly([context.experience, shuttleShield, avengerShield]);
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

                context.player1.clickCard(context.atst);
                expect(context.atst).toHaveExactUpgradeNames(['shield', 'frozen-in-carbonite']);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
