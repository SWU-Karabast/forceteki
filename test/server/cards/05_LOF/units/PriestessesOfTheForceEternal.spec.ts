describe('Pristesses of the Force, Eternal', function () {
    integration(function (contextRef) {
        describe('Pristesses of the Force\'s when played ability', function () {
            it('allow to use the Force to should give shield token to up to 5 unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['priestesses-of-the-force#eternal'],
                        groundArena: ['house-kast-soldier', 'mandalorian-warrior', 'wampa', 'nameless-terror'],
                        spaceArena: ['concord-dawn-interceptors'],
                        hasForceToken: true,
                    },
                    player2: {
                        groundArena: ['supercommando-squad', 'battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.priestessesOfTheForce);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([
                    context.priestessesOfTheForce,
                    context.houseKastSoldier,
                    context.mandalorianWarrior,
                    context.wampa,
                    context.namelessTerror,
                    context.concordDawnInterceptors,
                    context.supercommandoSquad,
                    context.battlefieldMarine,
                ]);
                context.player1.clickCard(context.priestessesOfTheForce);
                context.player1.clickCard(context.houseKastSoldier);
                context.player1.clickCard(context.mandalorianWarrior);
                context.player1.clickCard(context.concordDawnInterceptors);
                context.player1.clickCard(context.wampa);
                context.player1.clickCardNonChecking(context.namelessTerror);
                context.player1.clickPrompt('Done');

                expect(context.priestessesOfTheForce).toHaveExactUpgradeNames(['shield']);
                expect(context.houseKastSoldier).toHaveExactUpgradeNames(['shield']);
                expect(context.mandalorianWarrior).toHaveExactUpgradeNames(['shield']);
                expect(context.concordDawnInterceptors).toHaveExactUpgradeNames(['shield']);
                expect(context.wampa).toHaveExactUpgradeNames(['shield']);
                expect(context.namelessTerror).toHaveExactUpgradeNames([]);
                expect(context.supercommandoSquad).toHaveExactUpgradeNames([]);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            });

            it('allow to use the Force to should give shield token to up to 5 unit and can choose less than 5', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['priestesses-of-the-force#eternal'],
                        groundArena: ['house-kast-soldier', 'mandalorian-warrior', 'wampa', 'nameless-terror'],
                        spaceArena: ['concord-dawn-interceptors'],
                        hasForceToken: true,
                    },
                    player2: {
                        groundArena: ['supercommando-squad', 'battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.priestessesOfTheForce);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([
                    context.priestessesOfTheForce,
                    context.houseKastSoldier,
                    context.mandalorianWarrior,
                    context.wampa,
                    context.namelessTerror,
                    context.concordDawnInterceptors,
                    context.supercommandoSquad,
                    context.battlefieldMarine,
                ]);
                context.player1.clickCard(context.priestessesOfTheForce);
                context.player1.clickCard(context.houseKastSoldier);
                context.player1.clickCard(context.mandalorianWarrior);
                context.player1.clickCard(context.concordDawnInterceptors);
                context.player1.clickPrompt('Done');

                expect(context.priestessesOfTheForce).toHaveExactUpgradeNames(['shield']);
                expect(context.houseKastSoldier).toHaveExactUpgradeNames(['shield']);
                expect(context.mandalorianWarrior).toHaveExactUpgradeNames(['shield']);
                expect(context.concordDawnInterceptors).toHaveExactUpgradeNames(['shield']);
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.namelessTerror).toHaveExactUpgradeNames([]);
                expect(context.supercommandoSquad).toHaveExactUpgradeNames([]);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            });

            it('does nothing without the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['priestesses-of-the-force#eternal'],
                        groundArena: ['house-kast-soldier', 'mandalorian-warrior', 'wampa', 'nameless-terror'],
                        spaceArena: ['concord-dawn-interceptors'],
                        hasForceToken: false,
                    },
                    player2: {
                        groundArena: ['supercommando-squad', 'battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.priestessesOfTheForce);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

