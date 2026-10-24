describe('Boss Nass, Otoh Gunga Boss', function () {
    integration(function (contextRef) {
        describe('Boss Nass\'s when played ability', function () {
            it('should defeat a Shield token on a friendly Gungan unit to create a Beast token with a Shield token', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['boss-nass#otoh-gunga-boss'],
                        groundArena: [{ card: 'gungan-warrior', upgrades: ['shield', 'experience'] }, { card: 'porg', upgrades: ['shield'] }]
                    },
                    player2: {
                        groundArena: [{ card: 'jar-jar-binks#foolish-gungan', upgrades: ['shield'] }]
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.bossNass);

                expect(context.player1).toBeAbleToSelectExactly([context.gunganWarrior.upgrades[0]]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.gunganWarrior.upgrades[0]);

                expect(context.gunganWarrior).toHaveExactUpgradeNames(['experience']);

                const beast = context.player1.findCardByName('beast');
                expect(beast).toBeInZone('groundArena', context.player1);
                expect(beast).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to decline defeating the Shield token', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['boss-nass#otoh-gunga-boss'],
                        groundArena: [{ card: 'gungan-warrior', upgrades: ['shield'] }]
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.bossNass);
                context.player1.clickPrompt('Pass');

                expect(context.gunganWarrior).toHaveExactUpgradeNames(['shield']);
                expect(() => context.player1.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when no friendly Gungan unit has a Shield token', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['boss-nass#otoh-gunga-boss'],
                        groundArena: ['gungan-warrior']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.bossNass);

                expect(() => context.player1.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when the Shield token is on a friendly non-Gungan unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['boss-nass#otoh-gunga-boss'],
                        groundArena: [{ card: 'wampa', upgrades: ['shield'] }]
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.bossNass);

                expect(context.wampa).toHaveExactUpgradeNames(['shield']);
                expect(() => context.player1.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Boss Nass\'s on attack ability', function () {
            it('should defeat a Shield token on a friendly Gungan unit to create a Beast token with a Shield token', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['boss-nass#otoh-gunga-boss', { card: 'gungan-warrior', upgrades: ['shield'] }]
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.bossNass);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.gunganWarrior.upgrades[0]]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.gunganWarrior.upgrades[0]);

                expect(context.gunganWarrior).toHaveExactUpgradeNames([]);

                const beast = context.player1.findCardByName('beast');
                expect(beast).toBeInZone('groundArena', context.player1);
                expect(beast).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
