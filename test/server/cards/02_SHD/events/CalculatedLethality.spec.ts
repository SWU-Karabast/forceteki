describe('Calculated Lethality', function () {
    integration(function (contextRef) {
        describe('Calculated Lethality\'s ability', function () {
            it('should defeat a unit that cost 3 or less and distribute experience equal to the number of upgrade on the defeated unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['calculated-lethality'],
                        groundArena: [
                            { card: 'fifth-brother#fear-hunter', upgrades: ['fallen-lightsaber'] },
                        ],
                        spaceArena: ['corellian-freighter']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: [
                            { card: 'green-squadron-awing', upgrades: ['experience', 'shield'] },
                            'restored-arc170'
                        ]
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                function reset() {
                    context.player1.moveCard(context.calculatedLethality, 'hand');
                    context.player2.passAction();
                }

                context.player1.clickCard(context.calculatedLethality);
                expect(context.player1).toBeAbleToSelectExactly([context.fifthBrother, context.restoredArc170, context.greenSquadronAwing]);

                // kill a unit without upgrades
                context.player1.clickCard(context.restoredArc170);

                // no experience distributed
                expect(context.restoredArc170).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();

                reset();

                context.player1.clickCard(context.calculatedLethality);
                context.player1.clickCard(context.greenSquadronAwing);

                // unit defeated had 2 upgrades, can distribute 2 experience token between friendly units
                expect(context.player1).toBeAbleToSelectExactly([context.fifthBrother, context.corellianFreighter]);
                expect(context.player1).not.toHaveChooseNoTargetButton();

                // give 1 experience to fifth brother & corellian freighter
                context.player1.setDistributeExperiencePromptState(new Map([
                    [context.fifthBrother, 1],
                    [context.corellianFreighter, 1],
                ]));

                expect(context.player2).toBeActivePlayer();
                expect(context.greenSquadronAwing).toBeInZone('discard');
                expect(context.corellianFreighter).toHaveExactUpgradeNames(['experience']);
                expect(context.fifthBrother).toHaveExactUpgradeNames(['experience', 'fallen-lightsaber']);

                reset();

                context.player1.clickCard(context.calculatedLethality);

                // fifth brother is the only legal target and corellian is the only friendly unit, all system should be resolved automatically

                expect(context.player2).toBeActivePlayer();
                expect(context.fifthBrother).toBeInZone('discard');
                expect(context.corellianFreighter).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);
            });
            // TODO ADD A TEST WITH LURKIN TIE PHANTOM
        });
    });
});
