describe('Boss Lyonie, Hypnotized', function () {
    integration(function (contextRef) {
        describe('Boss Lyonie\'s when played ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['boss-lyonie#hypnotized'],
                        groundArena: [
                            { card: 'wampa', upgrades: ['shield'] },
                            { card: 'battlefield-marine', upgrades: ['academy-training'] }
                        ]
                    },
                    player2: {
                        groundArena: [
                            { card: 'atst', upgrades: ['experience'] },
                            { card: 'sundari-peacekeeper', upgrades: ['weakness'] }
                        ]
                    }
                });
            });

            it('should offer only token upgrades on other units, and give the chosen unit another of that token', function () {
                const { context } = contextRef;

                const wampaShield = context.wampa.upgrades[0];
                const atstExperience = context.atst.upgrades[0];
                const peacekeeperWeakness = context.sundariPeacekeeper.upgrades[0];

                context.player1.clickCard(context.bossLyonie);

                // Academy Training is a real upgrade, not a token, so it is not offered.
                expect(context.player1).toBeAbleToSelectExactly([wampaShield, atstExperience, peacekeeperWeakness]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(wampaShield);

                expect(context.wampa).toHaveExactUpgradeNames(['shield', 'shield']);
                expect(context.atst).toHaveExactUpgradeNames(['experience']);
                expect(context.sundariPeacekeeper).toHaveExactUpgradeNames(['weakness']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to give an enemy unit another Experience token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bossLyonie);
                context.player1.clickCard(context.atst.upgrades[0]);

                expect(context.atst).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.atst.getPower()).toBe(8);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to give an enemy unit another Weakness token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bossLyonie);
                context.player1.clickCard(context.sundariPeacekeeper.upgrades[0]);

                expect(context.sundariPeacekeeper).toHaveExactUpgradeNames(['weakness', 'weakness']);
                expect(context.sundariPeacekeeper.getPower()).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing if the player passes', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bossLyonie);
                context.player1.clickPrompt('Pass');

                expect(context.wampa).toHaveExactUpgradeNames(['shield']);
                expect(context.atst).toHaveExactUpgradeNames(['experience']);
                expect(context.sundariPeacekeeper).toHaveExactUpgradeNames(['weakness']);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Boss Lyonie\'s on attack ability should also trigger, and should not offer his own tokens', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [
                        { card: 'boss-lyonie#hypnotized', upgrades: ['shield'] },
                        { card: 'wampa', upgrades: ['experience'] }
                    ]
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            const wampaExperience = context.wampa.upgrades[0];

            context.player1.clickCard(context.bossLyonie);
            context.player1.clickCard(context.p2Base);

            // Lyonie's own Shield is attached to him, not to "another unit".
            expect(context.player1).toBeAbleToSelectExactly([wampaExperience]);
            context.player1.clickCard(wampaExperience);

            expect(context.wampa).toHaveExactUpgradeNames(['experience', 'experience']);
            expect(context.bossLyonie).toHaveExactUpgradeNames(['shield']);
            expect(context.p2Base.damage).toBe(5);
            expect(context.player2).toBeActivePlayer();
        });

        it('Boss Lyonie\'s ability should not prompt when there are no token upgrades on other units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['boss-lyonie#hypnotized'],
                    groundArena: [{ card: 'wampa', upgrades: ['academy-training'] }]
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bossLyonie);

            expect(context.bossLyonie).toBeInZone('groundArena', context.player1);
            expect(context.wampa).toHaveExactUpgradeNames(['academy-training']);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
