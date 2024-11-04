describe('Lom Pyke, Dealer in Truths', function() {
    integration(function(contextRef) {
        describe('Lom Pyke\'s on attack ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['lom-pyke#dealer-in-truths', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should give a Shield token to an enemy unit, and, if it does, a Shield token to a friendly unit', function () {
                const { context } = contextRef;

                const reset = () => {
                    context.lomPyke.exhausted = false;
                    context.player2.passAction();
                };

                // CASE 1: attack and activate ability
                context.player1.clickCard(context.lomPyke);
                context.player1.clickCard(context.wampa);

                // opponent shield target selection
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer).toHaveExactUpgradeNames(['shield']);

                // friendly shield target selection
                expect(context.player1).toBeAbleToSelectExactly([context.lomPyke, context.battlefieldMarine]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);

                expect(context.lomPyke.isUpgraded()).toBeFalse();
                expect(context.wampa.isUpgraded()).toBeFalse();
                expect(context.lomPyke.damage).toBe(4);
                expect(context.wampa.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();

                reset();

                // CASE 2: attack and pass ability
                context.player1.clickCard(context.lomPyke);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass ability');

                expect(context.cartelSpacer).toHaveExactUpgradeNames(['shield']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
                expect(context.lomPyke.isUpgraded()).toBeFalse();
                expect(context.wampa.isUpgraded()).toBeFalse();
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();

                reset();

                // CASE 3: attack and choose the attacker + defender as targets, no damage happens
                // as shields are given just before the attack damage resolves
                context.player1.clickCard(context.lomPyke);
                context.player1.clickCard(context.wampa);

                // opponent shield target selection
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['shield']);

                // friendly shield target selection
                expect(context.player1).toBeAbleToSelectExactly([context.lomPyke, context.battlefieldMarine]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.lomPyke);

                // TODO: replacement effect ordering logic is not fully in place. since both shields are owned by player1,
                // that player is then prompted to order the shield defeat resolution. This will be fixed eventually.
                context.player1.clickPrompt('Defeat shield to prevent attached unit from taking damage');

                expect(context.cartelSpacer).toHaveExactUpgradeNames(['shield']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
                expect(context.lomPyke.isUpgraded()).toBeFalse();
                expect(context.wampa.isUpgraded()).toBeFalse();
                expect(context.lomPyke.damage).toBe(4);
                expect(context.wampa.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Lom Pyke\'s on attack ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['lom-pyke#dealer-in-truths', 'battlefield-marine'],
                    }
                });
            });

            it('should automatically pass if there is no enemy unit to target', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lomPyke);
                expect(context.lomPyke.isUpgraded()).toBeFalse();
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Lom Pyke\'s on attack ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['lom-pyke#dealer-in-truths'],
                    }, player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should automatically choose targets if there is only one for each side', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lomPyke);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePassAbilityPrompt('Give a Shield token to an enemy unit');
                context.player1.clickPrompt('Give a Shield token to an enemy unit');

                expect(context.p2Base.damage).toBe(4);
                expect(context.lomPyke).toHaveExactUpgradeNames(['shield']);
                expect(context.wampa).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
