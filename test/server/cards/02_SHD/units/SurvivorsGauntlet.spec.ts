describe('Survivors Gauntlet', function() {
    integration(function(contextRef) {
        describe('Survivors Gauntle\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['survivors-gauntlet', 'entrenched', 'vanquish'],
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

            it('should allow to attach an upgrade to another eligible unit controlled by the same player', function () {
                const { context } = contextRef;

                // Scenario 1: Choose a friendly upgrade
                context.player1.clickCard(context.survivorsGauntlet);
                expect(context.player1).toBeAbleToSelectExactly([context.frozenInCarbonite, context.legalAuthority, context.shield, context.experience]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.frozenInCarbonite);
                expect(context.player1).toBeAbleToSelectExactly([context.fugitiveWookiee, context.battlefieldMarine, context.avenger, context.survivorsGauntlet]);

                context.player1.clickCard(context.fugitiveWookiee);

                expect(context.player2).toBeActivePlayer();
                expect(context.fugitiveWookiee.exhausted).toBe(false);
                expect(context.fugitiveWookiee).toHaveExactUpgradeNames(['frozen-in-carbonite']);

                context.player2.passAction();
                context.player1.clickCard(context.fugitiveWookiee);
                context.player1.clickCard(context.p2Base);
                context.moveToNextActionPhase();

                // Ensure that Frozen in Carbonite works as expected after being moved
                expect(context.fugitiveWookiee.exhausted).toBe(true);
                expect(context.atst.exhausted).toBe(false);

                // Scenario 2: Choose an enemy upgrade
                context.player1.clickCard(context.survivorsGauntlet);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.frozenInCarbonite, context.legalAuthority, context.shield, context.experience]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.legalAuthority);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.finn]);

                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toHaveExactUpgradeNames(['legal-authority']);
                expect(context.hylobonEnforcer).toHaveExactUpgradeNames(['shield']);

                // check that the upgrade is still controlled by the opponent
                context.player2.clickCard(context.finn);
                context.player2.clickCard(context.p1Base);
                expect(context.player2).toBeAbleToSelectExactly([context.legalAuthority, context.shield]);
                context.player2.clickPrompt('Pass');

                context.moveToNextActionPhase();

                // Scenario 3: Choose a token upgrade
                const p2BaseDamageBeforeAction = context.p2Base.damage;
                context.player1.clickCard(context.survivorsGauntlet);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.frozenInCarbonite, context.legalAuthority, context.shield, context.experience]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.experience);
                expect(context.player1).toBeAbleToSelectExactly([context.fugitiveWookiee, context.battlefieldMarine, context.atst, context.survivorsGauntlet, context.idenVersio]);

                context.player1.clickCard(context.survivorsGauntlet);

                expect(context.player2).toBeActivePlayer();
                expect(context.survivorsGauntlet).toHaveExactUpgradeNames(['experience']);
                expect(context.p2Base.damage).toBe(p2BaseDamageBeforeAction + 4 /* Survivors Gauntlet printed power */ + 1 /* experience token */);
            });

            it('should allow to not move any upgrade', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.survivorsGauntlet);
                expect(context.player1).toBeAbleToSelectExactly([context.frozenInCarbonite, context.legalAuthority, context.shield, context.experience]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();

                // No updates should have moved
                expect(context.atst).toHaveExactUpgradeNames(['frozen-in-carbonite']);
                expect(context.hylobonEnforcer).toHaveExactUpgradeNames(['legal-authority', 'shield']);
                expect(context.avenger).toHaveExactUpgradeNames(['experience']);
            });

            it('should not allow to move an upgrade on a unit controlled by another player than the upgrade controller', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.entrenched);
                context.player1.clickCard(context.wampa);
                context.player2.passAction();

                context.player1.clickCard(context.survivorsGauntlet);
                expect(context.player1).toBeAbleToSelectExactly([context.frozenInCarbonite, context.legalAuthority, context.shield, context.experience, context.entrenched]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.entrenched);
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.hylobonEnforcer, context.finn]);
                context.player1.clickCard(context.cartelSpacer);
            });

            it('should respect the upgrade attachment conditions', function () {
                const { context } = contextRef;

                // We clean player 2 board expect Finn and cartel Spacer
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.hylobonEnforcer);
                context.player1.clickPrompt('Collect Bounty: Draw a card');
                context.player1.clickPrompt('Pass');

                context.player2.clickCard(context.electrostaff);
                context.player2.clickCard(context.finn);

                context.player1.clickCard(context.avenger);
                context.player1.clickCard(context.p2Base);
                context.player2.clickCard(context.wampa);
                context.player2.passAction();


                context.player1.clickCard(context.survivorsGauntlet);
                // We can't select the Electrostaff because there is no eligible unit to attach it to
                expect(context.player1).toBeAbleToSelectExactly([context.frozenInCarbonite, context.experience]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');
            });
        });
    });
});
