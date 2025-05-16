describe('Qui-Gon Jinn\'s Lightsaber', () => {
    integration(function (contextRef) {
        describe('When Played on Qui-Gon Jinn', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: {
                            card: 'quigon-jinn#student-of-the-living-force',
                            deployed: true
                        },
                        hand: [
                            'quigon-jinns-lightsaber',
                        ],
                        groundArena: [
                            'quigon-jinn#the-negotiations-will-be-short', 'luke-skywalker#jedi-knight'
                        ],
                        spaceArena: [
                            'kylos-tie-silencer#ruthlessly-efficient'
                        ]
                    },
                    player2: {
                        groundArena: [
                            'cell-block-guard',
                            'phaseiii-dark-trooper',
                            'darth-vader#commanding-the-first-legion',
                        ]
                    }
                });
            });

            it('leader, it allows him to exhaust any number of units with combined cost 6 or less', function () {
                const { context } = contextRef;

                const quigonJinnLeader = context.player1.findCardByName('quigon-jinn#student-of-the-living-force');
                const quigonJinnUnit = context.player1.findCardByName('quigon-jinn#the-negotiations-will-be-short');

                // Play the lightsaber on Qui-Gon Jinn leader
                context.player1.clickCard(context.quigonJinnsLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([
                    quigonJinnLeader,
                    quigonJinnUnit,
                    context.lukeSkywalker
                ]);

                context.player1.clickCard(quigonJinnLeader);
                expect(quigonJinnLeader).toHaveExactUpgradeNames(['quigon-jinns-lightsaber']);
                context.player1.clickPrompt('Trigger');

                // Trigger the ability to exhaust any number of units with combined cost 6 or less
                expect(context.player1).toBeAbleToSelectExactly([
                    context.phaseiiiDarkTrooper,
                    quigonJinnLeader,
                    context.cellBlockGuard,
                    context.kylosTieSilencer,
                ]);
                expect(context.player1).toHaveChooseNothingButton();

                // Selects multiple units with combined cost ≤ 6
                context.player1.clickCard(context.phaseiiiDarkTrooper);
                context.player1.clickCard(context.cellBlockGuard);
                context.player1.clickPrompt('Done');

                expect(context.cellBlockGuard.exhausted).toBe(true);
                expect(context.phaseiiiDarkTrooper.exhausted).toBe(true);
            });

            it('leader, it allows him to exhaust any number of units with combined cost 6 or less', function () {
                const { context } = contextRef;

                const quigonJinnLeader = context.player1.findCardByName('quigon-jinn#student-of-the-living-force');
                const quigonJinnUnit = context.player1.findCardByName('quigon-jinn#the-negotiations-will-be-short');

                // Play the lightsaber on Qui-Gon Jinn leader
                context.player1.clickCard(context.quigonJinnsLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([
                    quigonJinnLeader,
                    quigonJinnUnit,
                    context.lukeSkywalker
                ]);

                context.player1.clickCard(quigonJinnLeader);
                expect(quigonJinnLeader).toHaveExactUpgradeNames(['quigon-jinns-lightsaber']);
                context.player1.clickPrompt('Trigger');

                // Trigger the ability to exhaust any number of units with combined cost 6 or less
                expect(context.player1).toBeAbleToSelectExactly([
                    context.phaseiiiDarkTrooper,
                    quigonJinnLeader,
                    context.cellBlockGuard,
                    context.kylosTieSilencer,
                ]);
                expect(context.player1).toHaveChooseNothingButton();

                // Selects Qui Gon Jinn leader
                context.player1.clickCard(quigonJinnLeader);

                // Verify only units that keep combined cost ≤ 6 can be selected
                expect(context.player1).not.toBeAbleToSelectExactly([
                    context.phaseiiiDarkTrooper,
                    context.cellBlockGuard,
                    context.kylosTieSilencer,
                ]);
                context.player1.clickPrompt('Done');

                expect(quigonJinnLeader.exhausted).toBe(true);
            });

            it('unit, it allows him to exhaust any number of units with combined cost 6 or less', function () {
                const { context } = contextRef;

                const quigonJinnLeader = context.player1.findCardByName('quigon-jinn#student-of-the-living-force');
                const quigonJinnUnit = context.player1.findCardByName('quigon-jinn#the-negotiations-will-be-short');

                // Play the lightsaber on Qui-Gon Jinn leader
                context.player1.clickCard(context.quigonJinnsLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([
                    quigonJinnLeader,
                    quigonJinnUnit,
                    context.lukeSkywalker
                ]);

                context.player1.clickCard(quigonJinnUnit);
                expect(quigonJinnUnit).toHaveExactUpgradeNames(['quigon-jinns-lightsaber']);
                context.player1.clickPrompt('Trigger');

                // Trigger the ability to exhaust any number of units with combined cost 6 or less
                expect(context.player1).toBeAbleToSelectExactly([
                    context.phaseiiiDarkTrooper,
                    quigonJinnLeader,
                    context.cellBlockGuard,
                    context.kylosTieSilencer,
                ]);
                expect(context.player1).toHaveChooseNothingButton();

                // Selects multiple units with combined cost ≤ 6
                context.player1.clickCard(context.phaseiiiDarkTrooper);
                context.player1.clickCard(context.kylosTieSilencer);
                context.player1.clickPrompt('Done');

                expect(context.phaseiiiDarkTrooper.exhausted).toBe(true);
                expect(context.kylosTieSilencer.exhausted).toBe(true);
            });

            it('unit, it allows him to exhaust any number of units with combined cost 6 or less even if unit is already exhausted', function () {
                const { context } = contextRef;

                const quigonJinnLeader = context.player1.findCardByName('quigon-jinn#student-of-the-living-force');
                const quigonJinnUnit = context.player1.findCardByName('quigon-jinn#the-negotiations-will-be-short');

                context.phaseiiiDarkTrooper.exhausted = true;
                expect(context.phaseiiiDarkTrooper.exhausted).toBe(true);

                // Play the lightsaber on Qui-Gon Jinn leader
                context.player1.clickCard(context.quigonJinnsLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([
                    quigonJinnLeader,
                    quigonJinnUnit,
                    context.lukeSkywalker
                ]);

                context.player1.clickCard(quigonJinnUnit);
                expect(quigonJinnUnit).toHaveExactUpgradeNames(['quigon-jinns-lightsaber']);
                context.player1.clickPrompt('Trigger');

                // Trigger the ability to exhaust any number of units with combined cost 6 or less
                expect(context.player1).toBeAbleToSelectExactly([
                    context.phaseiiiDarkTrooper,
                    quigonJinnLeader,
                    context.cellBlockGuard,
                    context.kylosTieSilencer,
                ]);
                expect(context.player1).toHaveChooseNothingButton();

                // Selects multiple units with combined cost ≤ 6 and test non checking
                context.player1.clickCard(context.phaseiiiDarkTrooper);
                context.player1.clickCard(context.kylosTieSilencer);
                context.player1.clickPrompt('Done');

                expect(context.phaseiiiDarkTrooper.exhausted).toBe(true);
                expect(context.kylosTieSilencer.exhausted).toBe(true);
            });

            it('unit, but it\'s not Qui Gon Jinn', function () {
                const { context } = contextRef;

                const quigonJinnLeader = context.player1.findCardByName('quigon-jinn#student-of-the-living-force');
                const quigonJinnUnit = context.player1.findCardByName('quigon-jinn#the-negotiations-will-be-short');

                // Play the lightsaber on Qui-Gon Jinn leader
                context.player1.clickCard(context.quigonJinnsLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([
                    quigonJinnLeader,
                    quigonJinnUnit,
                    context.lukeSkywalker
                ]);

                context.player1.clickCard(context.lukeSkywalker);
                expect(context.lukeSkywalker).toHaveExactUpgradeNames(['quigon-jinns-lightsaber']);

                // Nothing happens
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});