describe('Darth Maul\'s Lightsaber', () => {
    integration(function (contextRef) {
        const prompt = 'Attack with Darth Maul. For this attack, he gains overwhelm and can\'t attack bases.';

        describe('When Played on Darth Maul', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: {
                            card: 'darth-maul#sith-revealed',
                            deployed: true
                        },
                        hand: [
                            'darth-mauls-lightsaber',
                        ],
                        groundArena: [
                            'darth-maul#revenge-at-last'
                        ],
                        spaceArena: [
                            'kylos-tie-silencer#ruthlessly-efficient'
                        ]
                    },
                    player2: {
                        groundArena: [
                            'cell-block-guard',
                            'phaseiii-dark-trooper'
                        ]
                    }
                });
            });

            it('leader, it allows him to attack, gain Overwhelm and prevents him from attacking bases', function () {
                const { context } = contextRef;

                const darthMaulLeader = context.player1.findCardByName('darth-maul#sith-revealed');
                const darthMaulUnit = context.player1.findCardByName('darth-maul#revenge-at-last');

                // Play the lightsaber on Darth Maul leader
                context.player1.clickCard(context.darthMaulsLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([
                    darthMaulLeader,
                    darthMaulUnit
                ]);

                context.player1.clickCard(darthMaulLeader);
                expect(darthMaulLeader).toHaveExactUpgradeNames(['darth-mauls-lightsaber']);

                // Trigger the ability to attack the Cell Block Guard
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.cellBlockGuard,
                    context.phaseiiiDarkTrooper
                ]);
                context.player1.clickCard(context.cellBlockGuard);

                // Resolve Maul's On Attack ability
                context.player1.clickCard(context.cellBlockGuard);
                context.player1.clickCard(context.phaseiiiDarkTrooper);
                context.player1.clickDone();

                // Check the result of the attack
                expect(context.cellBlockGuard).toBeInZone('discard');
                expect(darthMaulLeader.damage).toBe(3);
                expect(context.p2Base.damage).toBe(7);  // overwhelm 7 to base
            });

            it('unit, it allows him to attack, gain Overwhelm and prevents him from attacking bases', function () {
                const { context } = contextRef;

                const darthMaulLeader = context.player1.findCardByName('darth-maul#sith-revealed');
                const darthMaulUnit = context.player1.findCardByName('darth-maul#revenge-at-last');

                // Play the lightsaber on Darth Maul unit
                context.player1.clickCard(context.darthMaulsLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([
                    darthMaulLeader,
                    darthMaulUnit
                ]);

                context.player1.clickCard(darthMaulUnit);
                expect(darthMaulUnit).toHaveExactUpgradeNames(['darth-mauls-lightsaber']);

                // Trigger the ability to attack the Cell Block Guard
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.cellBlockGuard,
                    context.phaseiiiDarkTrooper
                ]);

                // Choose to attack both units for Maul's ability
                context.player1.clickCard(context.cellBlockGuard);
                context.player1.clickCard(context.phaseiiiDarkTrooper);
                context.player1.clickDone();

                // Check the result of the attack
                expect(context.cellBlockGuard).toBeInZone('discard');
                expect(context.phaseiiiDarkTrooper).toBeInZone('discard');
                expect(darthMaulUnit.damage).toBe(6);
                expect(context.p2Base.damage).toBe(12);  // overwhelm 6 + 6 to base
            });

            it('allows the player to pass on the ability', function () {
                const { context } = contextRef;

                const darthMaulLeader = context.player1.findCardByName('darth-maul#sith-revealed');
                const darthMaulUnit = context.player1.findCardByName('darth-maul#revenge-at-last');

                // Play the lightsaber on Darth Maul leader
                context.player1.clickCard(context.darthMaulsLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([
                    darthMaulLeader,
                    darthMaulUnit
                ]);

                context.player1.clickCard(darthMaulLeader);
                expect(darthMaulLeader).toHaveExactUpgradeNames(['darth-mauls-lightsaber']);

                // Pass on the ability to attack
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt('Pass');

                expect(darthMaulLeader.exhausted).toBeFalse();
                expect(darthMaulLeader.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
            });

            it('does not grant Overwhelm if the player passes', function () {
                const { context } = contextRef;

                const maulLeader = context.player1.findCardByName('darth-maul#sith-revealed');
                const maulUnit = context.player1.findCardByName('darth-maul#revenge-at-last');

                // Play the lightsaber on Darth Maul leader
                context.player1.clickCard(context.darthMaulsLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([
                    maulLeader,
                    maulUnit
                ]);

                context.player1.clickCard(maulLeader);
                expect(maulLeader).toHaveExactUpgradeNames(['darth-mauls-lightsaber']);

                // Pass on the ability to attack
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt('Pass');

                // Player 2 attacks with the Phase III Dark Trooper
                context.player2.clickCard(context.phaseiiiDarkTrooper);
                context.player2.clickCard(context.p1Base);

                // Player 1 attacks with Darth Maul, but he doesn't have Overwhelm
                context.player1.clickCard(maulLeader);
                context.player1.clickCard(context.phaseiiiDarkTrooper);

                // Resolve Maul's On Attack ability
                context.player1.clickCard(context.cellBlockGuard);
                context.player1.clickCard(context.phaseiiiDarkTrooper);
                context.player1.clickDone();

                // Check the result of the attack
                expect(maulLeader.exhausted).toBeTrue();
                expect(context.phaseiiiDarkTrooper).toBeInZone('discard');
                expect(maulLeader.damage).toBe(3);
                expect(context.p2Base.damage).toBe(0); // no overwhelm
            });
        });

        describe('When Played on units not named Darth Maul', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: {
                            card: 'maul#a-rival-in-darkness',
                            deployed: true
                        },
                        hand: [
                            'darth-mauls-lightsaber',
                        ],
                        groundArena: [
                            'maul#shadow-collective-visionary',
                            'fifth-brother#fear-hunter'
                        ],
                        spaceArena: [
                            'kylos-tie-silencer#ruthlessly-efficient'
                        ]
                    },
                    player2: {
                        groundArena: [
                            'cell-block-guard',
                            'phaseiii-dark-trooper'
                        ]
                    }
                });
            });

            it('it does not allow the player to attack with Maul leader', function () {
                const { context } = contextRef;

                const maulLeader = context.player1.findCardByName('maul#a-rival-in-darkness');
                const maulUnit = context.player1.findCardByName('maul#shadow-collective-visionary');

                // Play the lightsaber on Maul leader
                context.player1.clickCard(context.darthMaulsLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([
                    maulLeader,
                    maulUnit,
                    context.fifthBrother
                ]);

                context.player1.clickCard(maulLeader);
                expect(maulLeader).toHaveExactUpgradeNames(['darth-mauls-lightsaber']);

                // No ability is triggered
                expect(context.player1).not.toHavePassAbilityPrompt(prompt);
                expect(context.player2).toBeActivePlayer();
            });

            it('it does not allow the player to attack with Maul unit', function () {
                const { context } = contextRef;

                const maulLeader = context.player1.findCardByName('maul#a-rival-in-darkness');
                const maulUnit = context.player1.findCardByName('maul#shadow-collective-visionary');

                // Play the lightsaber on Maul unit
                context.player1.clickCard(context.darthMaulsLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([
                    maulUnit,
                    maulLeader,
                    context.fifthBrother
                ]);

                context.player1.clickCard(maulUnit);
                expect(maulUnit).toHaveExactUpgradeNames(['darth-mauls-lightsaber']);

                // No ability is triggered
                expect(context.player1).not.toHavePassAbilityPrompt(prompt);
                expect(context.player2).toBeActivePlayer();
            });

            it('it does not allow the player to attack with other units', function () {
                const { context } = contextRef;

                const maulLeader = context.player1.findCardByName('maul#a-rival-in-darkness');
                const maulUnit = context.player1.findCardByName('maul#shadow-collective-visionary');

                // Play the lightsaber on Fifth Brother
                context.player1.clickCard(context.darthMaulsLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([
                    maulUnit,
                    maulLeader,
                    context.fifthBrother
                ]);

                context.player1.clickCard(context.fifthBrother);
                expect(context.fifthBrother).toHaveExactUpgradeNames(['darth-mauls-lightsaber']);

                // No ability is triggered
                expect(context.player1).not.toHavePassAbilityPrompt(prompt);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});