describe('Finn, This is a Rescue', function () {
    integration(function (contextRef) {
        describe('Finn\'s undeployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['jedi-lightsaber'],
                        leader: { card: 'finn#this-is-a-rescue', deployed: false },
                        groundArena: ['battlefield-marine'],
                        resources: 5
                    },
                    player2: {
                        hand: ['top-target'],
                        groundArena: ['wampa'],
                        resources: 5
                    }
                });
            });

            it('should defeat a friendly upgrade and give a shield token', function () {
                const { context } = contextRef;

                // Equip a friendly upgrade to battlefield marine
                context.player1.clickCard(context.jediLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['jedi-lightsaber']);

                context.player2.passAction();

                // Use Finn's ability
                context.player1.clickCard(context.finn);
                context.player1.clickPrompt('Defeat a friendly upgrade on a unit. If you do, give a Shield token to that unit');
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            });

            it('should not be able to defeat an opponent\'s (non-friendly) upgrade', function () {
                const { context } = contextRef;

                // Equip a friendly upgrade to battlefield marine
                context.player1.clickCard(context.jediLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['jedi-lightsaber']);

                // Opponent equips an upgrade to battlefield marine
                context.player2.clickCard(context.topTarget);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['jedi-lightsaber', 'top-target']);

                // Unable to use Finn's ability on non-friendly upgrade
                context.player1.clickCard(context.finn);
                context.player1.clickPrompt('Defeat a friendly upgrade on a unit. If you do, give a Shield token to that unit');
                expect(context.player1).not.toBeAbleToSelect(context.topTarget);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['top-target', 'shield']);
            });
        });

        describe('Finn\'s deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['jedi-lightsaber'],
                        leader: { card: 'finn#this-is-a-rescue', deployed: true },
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['experience'] }],
                        resources: 5
                    },
                    player2: {
                        hand: ['top-target'],
                        groundArena: ['wampa'],
                        resources: 5
                    }
                });
            });

            it('should defeat a friendly upgrade and give a shield token on attack', function () {
                const { context } = contextRef;

                // Equip a friendly upgrade to battlefield marine
                context.player1.clickCard(context.jediLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.finn, context.battlefieldMarine, context.wampa]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience', 'jedi-lightsaber']);

                context.player2.passAction();

                // Attack with Finn
                context.player1.clickCard(context.finn);
                expect(context.player1).toHavePrompt('Choose a target for attack');
                context.player1.clickCard(context.p2Base);

                // Use Finn's ability
                expect(context.player1).toHavePrompt('Choose an upgrade');
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.experience);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['jedi-lightsaber', 'shield']);
            });

            it('should not be able to defeat an opponent\'s (non-friendly) upgrade on attack', function () {
                const { context } = contextRef;

                // Equip a friendly upgrade to battlefield marine
                context.player1.clickCard(context.jediLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.finn, context.battlefieldMarine, context.wampa]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience', 'jedi-lightsaber']);

                // Opponent equips an upgrade to battlefield marine
                context.player2.clickCard(context.topTarget);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience', 'jedi-lightsaber', 'top-target']);

                // Attack with Finn
                context.player1.clickCard(context.finn);
                expect(context.player1).toHavePrompt('Choose a target for attack');
                context.player1.clickCard(context.p2Base);

                // Use Finn's ability
                expect(context.player1).toHavePrompt('Choose an upgrade');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.experience, context.jediLightsaber]);
            });
        });
    });
});
