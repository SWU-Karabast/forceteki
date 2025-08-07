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
                expect(context.player1).not.toHaveChooseNothingButton();

                // give 1 experience to fifth brother & corellian freighter
                context.player1.setDistributeExperiencePromptState(new Map([
                    [context.fifthBrother, 1],
                    [context.corellianFreighter, 1],
                ]));

                expect(context.getChatLogs(1)).toContain('player1 uses Calculated Lethality to give 1 Experience token to Fifth Brother and 1 Experience token to Corellian Freighter');

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

            it('does not defeat Lurking TIE Phantom, but does still distribute experience', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['calculated-lethality'],
                        groundArena: [
                            'pyke-sentinel'
                        ]
                    },
                    player2: {
                        spaceArena: [
                            { card: 'lurking-tie-phantom', upgrades: ['experience', 'experience'] }
                        ]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.calculatedLethality);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.pykeSentinel,
                    context.lurkingTiePhantom
                ]);
                context.player1.clickCard(context.lurkingTiePhantom);

                expect(context.lurkingTiePhantom).toBeInZone('spaceArena');

                expect(context.pykeSentinel).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing if no unit can be targeted', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['calculated-lethality']
                    },
                    player2: {
                        groundArena: [
                            {
                                card: 'iden-versio#adapt-or-die',
                                damage: 0,
                                exhausted: true,
                                upgrades: [
                                    'shield',
                                    'legal-authority'
                                ],
                                capturedUnits: [
                                    'resupply-carrier'
                                ]
                            }
                        ],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.calculatedLethality);
                expect(context.player1).toHavePrompt('Playing Calculated Lethality will have no effect. Are you sure you want to play it?');

                context.player1.clickPrompt('Play anyway');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
