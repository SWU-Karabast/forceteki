describe('Fire Across the Galaxy', function () {
    integration(function (contextRef) {
        it('should use all available friendly Spectre When Played abilities', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fire-across-the-galaxy'],
                    groundArena: [{ card: 'ezra-bridger#spectre-six', damage: 3 }, 'chopper#spectre-three', 'academy-defense-walker'],
                    spaceArena: ['the-ghost#spectre-home-base'],
                },
                player2: {
                    groundArena: ['kanan-jarrus#spectre-one'],
                    spaceArena: ['ruthless-raider']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fireAcrossTheGalaxy);

            expect(context.player1).toBeAbleToSelectExactly([context.ezraBridger, context.chopper, context.theGhost]);
            expect(context.player1).toHaveEnabledPromptButton('Cancel');
            context.player1.clickCard(context.ezraBridger);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.chopper);
            context.player1.clickCard(context.theGhost);
            context.player1.clickPrompt('Done');

            // Ezra ability should be first
            expect(context.player1).toHavePrompt('Heal 4 damage from a unit');
            context.player1.clickCard(context.ezraBridger);
            expect(context.ezraBridger.damage).toBe(0);

            // Chopper trigger and resolve after
            expect(context.chopper).toHaveExactUpgradeNames(['experience', 'experience']);

            // Ghost last
            context.player1.clickCard(context.ezraBridger);
            expect(context.ezraBridger).toHaveExactUpgradeNames(['shield']);

            expect(context.player2).toBeActivePlayer();
        });

        it('should use some of the available friendly Spectre When Played abilities', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fire-across-the-galaxy'],
                    groundArena: [{ card: 'ezra-bridger#spectre-six', damage: 3 }, 'chopper#spectre-three', 'academy-defense-walker'],
                    spaceArena: ['the-ghost#spectre-home-base'],
                },
                player2: {
                    groundArena: ['kanan-jarrus#spectre-one'],
                    spaceArena: ['ruthless-raider']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fireAcrossTheGalaxy);

            expect(context.player1).toBeAbleToSelectExactly([context.ezraBridger, context.chopper, context.theGhost]);
            expect(context.player1).toHaveEnabledPromptButton('Cancel');
            context.player1.clickCard(context.ezraBridger);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.theGhost);
            context.player1.clickPrompt('Done');

            // Ezra ability should be first
            expect(context.player1).toHavePrompt('Heal 4 damage from a unit');
            context.player1.clickCard(context.ezraBridger);
            expect(context.ezraBridger.damage).toBe(0);

            // Ghost last
            context.player1.clickCard(context.ezraBridger);
            expect(context.ezraBridger).toHaveExactUpgradeNames(['shield']);

            expect(context.player2).toBeActivePlayer();
            // Chopper trigger and resolve shouldn't have happened
            expect(context.chopper.isUpgraded()).toBeFalse();
        });

        it('should not be able to select a spectre that has lost its abilities', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fire-across-the-galaxy'],
                    groundArena: [{ card: 'ezra-bridger#spectre-six', damage: 3 }, { card: 'chopper#spectre-three', upgrades: ['imprisoned'] }, 'academy-defense-walker'],
                    spaceArena: ['the-ghost#spectre-home-base'],
                },
                player2: {
                    groundArena: ['kanan-jarrus#spectre-one'],
                    spaceArena: ['ruthless-raider']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fireAcrossTheGalaxy);

            expect(context.player1).toBeAbleToSelectExactly([context.ezraBridger, context.theGhost]);
            expect(context.player1).toHaveEnabledPromptButton('Cancel');
            context.player1.clickCard(context.ezraBridger);
            expect(context.player1).toHaveEnabledPromptButton('Done');
            context.player1.clickCard(context.theGhost);
            context.player1.clickPrompt('Done');

            // Ezra ability should be first
            expect(context.player1).toHavePrompt('Heal 4 damage from a unit');
            context.player1.clickCard(context.ezraBridger);
            expect(context.ezraBridger.damage).toBe(0);

            // Ghost last
            context.player1.clickCard(context.ezraBridger);
            expect(context.ezraBridger).toHaveExactUpgradeNames(['shield']);

            expect(context.player2).toBeActivePlayer();
            // Chopper trigger and resolve shouldn't have happened
            expect(context.chopper).toHaveExactUpgradeNames(['imprisoned']);
        });
    });
});