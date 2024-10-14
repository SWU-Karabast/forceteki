describe('Leia Organa, Alliance General', function() {
    integration(function(contextRef) {
        describe('Leia\'s undeployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist', 'atst', 'battlefield-marine', 'fleet-lieutenant', { card: 'rebel-pathfinder', exhausted: true }],
                        spaceArena: ['tieln-fighter', 'alliance-xwing'],
                        leader: 'leia-organa#alliance-general'
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                        spaceArena: ['tie-advanced']
                    }
                });
            });

            it('should attack with two Rebel units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickPrompt('Attack with a Rebel unit');
                expect(context.player1).toBeAbleToSelectExactly([context.sabineWren, context.battlefieldMarine, context.fleetLieutenant, context.allianceXwing]);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.sundariPeacekeeper);
                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.sundariPeacekeeper.damage).toBe(3);
                expect(context.battlefieldMarine.damage).toBe(1);

                // second attack
                expect(context.player1).toBeActivePlayer();
                expect(context.player1).toBeAbleToSelectExactly([context.sabineWren, context.fleetLieutenant, context.allianceXwing]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.allianceXwing);
                expect(context.player1).toHavePassAttackButton();
                context.player1.clickCard(context.p2Base);
                expect(context.allianceXwing.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(2);

                expect(context.player2).toBeActivePlayer();
                expect(context.leiaOrgana.exhausted).toBe(true);
            });

            it('should allow passing the second attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickPrompt('Attack with a Rebel unit');

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.sundariPeacekeeper);

                // second attack
                expect(context.player1).toBeActivePlayer();
                expect(context.player1).toBeAbleToSelectExactly([context.sabineWren, context.fleetLieutenant, context.allianceXwing]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass ability');

                expect(context.player2).toBeActivePlayer();
                expect(context.leiaOrgana.exhausted).toBe(true);
            });

            it('should allow appropriate attack triggers to happen when either attack is declared', function () {
                const { context } = contextRef;

                // unit with trigger first
                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickPrompt('Attack with a Rebel unit');
                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.sundariPeacekeeper);

                // being prompted for Sabine trigger target
                expect(context.sabineWren.damage).toBe(0);
                expect(context.sundariPeacekeeper.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
                expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper, context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                // trigger and attack go through
                expect(context.p2Base.damage).toBe(1);
                expect(context.sabineWren.damage).toBe(1);
                expect(context.sundariPeacekeeper.damage).toBe(2);

                // second attack
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.fleetLieutenant, context.allianceXwing]);
                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.tieAdvanced);
                expect(context.allianceXwing).toBeInLocation('discard');
                expect(context.tieAdvanced).toBeInLocation('discard');

                expect(context.player2).toBeActivePlayer();

                context.moveToNextActionPhase();

                // unit with trigger second
                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickPrompt('Attack with a Rebel unit');
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // second attack
                expect(context.player1).toBeAbleToSelectExactly([context.sabineWren, context.fleetLieutenant, context.rebelPathfinder]);
                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.sundariPeacekeeper);

                // being prompted for Sabine trigger target
                expect(context.sabineWren.damage).toBe(1);
                expect(context.sundariPeacekeeper.damage).toBe(2);
                expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper, context.p1Base, context.p2Base]);
            });
        });

        describe('Leia\'s undeployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', { card: 'rebel-pathfinder', exhausted: true }],
                        spaceArena: ['tieln-fighter'],
                        leader: 'leia-organa#alliance-general'
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                        spaceArena: ['tie-advanced']
                    }
                });
            });

            it('can be activated with no target', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickPrompt('Attack with a Rebel unit');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Leia\'s deployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', 'fleet-lieutenant', { card: 'battlefield-marine', exhausted: true }],
                        spaceArena: ['alliance-xwing'],
                        leader: { card: 'leia-organa#alliance-general', deployed: true }
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should allow attacking with another Rebel unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickCard(context.sundariPeacekeeper);

                expect(context.leiaOrgana.exhausted).toBe(true);
                expect(context.leiaOrgana.damage).toBe(1);
                expect(context.sundariPeacekeeper.damage).toBe(4);

                expect(context.player1).toBeAbleToSelectExactly([context.fleetLieutenant, context.allianceXwing]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.fleetLieutenant);
                expect(context.player1).toHavePassAttackButton();
                context.player1.clickCard(context.p2Base);
                expect(context.fleetLieutenant.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(3);
                expect(context.fleetLieutenant.damage).toBe(0);

                context.player2.passAction();

                // second Leia attack to confirm that passing the ability works
                context.leiaOrgana.exhausted = false;
                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickCard(context.p2Base);
                expect(context.leiaOrgana.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(7);

                expect(context.player1).toHaveEnabledPromptButton('Attack with another Rebel unit');
                expect(context.player1).toHaveEnabledPromptButton('Pass');
                context.player1.clickPrompt('Pass');

                context.player2.passAction();

                // third Leia attack to confirm that the ability isn't triggered if there is no legal attacker
                context.allianceXwing.exhausted = true;
                context.leiaOrgana.exhausted = false;
                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickCard(context.p2Base);
                expect(context.leiaOrgana.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(11);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
