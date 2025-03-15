describe('U-Wing Lander', function () {
    integration(function (contextRef) {
        it('U-Wing Lander\'s ability should give itself 3 experience tokens', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['uwing-lander']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.uwingLander);

            expect(context.player2).toBeActivePlayer();
            expect(context.uwingLander).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);
        });

        describe('U-Wing Lander\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', 'wampa'],
                        spaceArena: [{ card: 'uwing-lander', upgrades: ['superheavy-ion-cannon', 'experience'] }, 'devastator#inescapable']
                    },
                    player2: {
                        groundArena: ['reinforcement-walker'],
                        spaceArena: ['avenger#hunting-star-destroyer']
                    }
                });
            });

            it('should attach one of its upgrade to another friendly eligible Vehicle unit (experience)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.uwingLander);
                context.player1.clickCard(context.p2Base);

                // superheavy ion cannon prompt
                expect(context.player1).toHavePrompt('Exhaust a enemy non-leader unit');
                context.player1.clickPrompt('Pass');

                expect(context.player1).toBeAbleToSelectExactly([context.superheavyIonCannon, context.experience]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.experience);
                expect(context.player1).toBeAbleToSelectExactly([context.devastator, context.atst]);
                context.player1.clickCard(context.atst);
                expect(context.player2).toBeActivePlayer();
                expect(context.atst).toHaveExactUpgradeNames(['experience']);
            });

            it('should attach one of its upgrade to another friendly eligible Vehicle unit (more restriction)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.uwingLander);
                context.player1.clickCard(context.p2Base);

                // superheavy ion cannon prompt
                expect(context.player1).toHavePrompt('Exhaust a enemy non-leader unit');
                context.player1.clickPrompt('Pass');

                expect(context.player1).toBeAbleToSelectExactly([context.superheavyIonCannon, context.experience]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.superheavyIonCannon);
                expect(context.player1).toBeAbleToSelectExactly([context.devastator]);
                context.player1.clickCard(context.devastator);

                expect(context.player2).toBeActivePlayer();
                expect(context.devastator).toHaveExactUpgradeNames(['superheavy-ion-cannon']);
            });

            it('should not do anything as we do not completes attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.uwingLander);
                context.player1.clickCard(context.avenger);

                // superheavy ion cannon prompt
                expect(context.player1).toHavePrompt('Exhaust a enemy non-leader unit');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.superheavyIonCannon).toBeInZone('discard');
            });
        });
    });
});
