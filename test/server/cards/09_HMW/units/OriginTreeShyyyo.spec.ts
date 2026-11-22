describe('Origin Tree Shyyyo', function() {
    integration(function(contextRef) {
        describe('its cost-reduction ability', function() {
            describe('while controlling a Kashyyyk base', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            base: 'origin-tree',
                            groundArena: ['origin-tree-shyyyo'],
                            hand: [
                                'offworld-jawa', // cost 1
                                'gifted-urchin', // cost 2
                                'noti-mobile-pod', // cost 3
                                'brain-invaders', // cost 4
                                'bank-job-fugitives', // cost 6
                                'headhunter-squadron', // cost 2
                                'evasive-maneuver', // cost 2 event
                                'holdout-blaster' // cost 1 upgrade
                            ]
                        },
                        player2: {
                            hand: ['battlefield-marine']
                        }
                    });
                });

                it('reduces the cost of the first unit played this round by 1', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.notiMobilePod);
                    expect(context.player1.exhaustedResourceCount).toBe(2); // 3 - 1
                });

                it('reduces the cost of the second unit played this round by 2', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.giftedUrchin); // 1st unit, 2 - 1 = 1
                    context.player2.passAction();

                    const before = context.player1.exhaustedResourceCount;
                    context.player1.clickCard(context.brainInvaders); // 2nd unit, 4 - 2 = 2
                    expect(context.player1.exhaustedResourceCount - before).toBe(2);
                });

                it('reduces the cost of the third unit played this round by 3', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.offworldJawa); // 1st unit, 1 - 1 = 0
                    context.player2.passAction();
                    context.player1.clickCard(context.giftedUrchin); // 2nd unit, 2 - 2 = 0
                    context.player2.passAction();

                    const before = context.player1.exhaustedResourceCount;
                    context.player1.clickCard(context.bankJobFugitives); // 3rd unit, 6 - 3 = 3
                    expect(context.player1.exhaustedResourceCount - before).toBe(3);
                });

                it('does not reduce the cost of the fourth unit played this round', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.offworldJawa); // 1st unit
                    context.player2.passAction();
                    context.player1.clickCard(context.giftedUrchin); // 2nd unit
                    context.player2.passAction();
                    context.player1.clickCard(context.notiMobilePod); // 3rd unit, 3 - 3 = 0
                    context.player2.passAction();

                    const before = context.player1.exhaustedResourceCount;
                    context.player1.clickCard(context.brainInvaders); // 4th unit, no discount
                    expect(context.player1.exhaustedResourceCount - before).toBe(4);
                });

                it('does not count units the opponent plays toward the controller\'s own count', function() {
                    const { context } = contextRef;

                    // Opponent plays a unit; this doesn't affect player1's own ordinal count
                    context.player1.passAction();
                    context.player2.clickCard(context.battlefieldMarine);

                    context.player1.clickCard(context.notiMobilePod); // still player1's 1st unit, 3 - 1 = 2
                    expect(context.player1.exhaustedResourceCount).toBe(2);
                });

                it('resets the unit count at the start of each new round', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.offworldJawa); // 1st unit this round, 1 - 1 = 0
                    expect(context.player1.exhaustedResourceCount).toBe(0);

                    context.moveToNextActionPhase();

                    const before = context.player1.exhaustedResourceCount;
                    context.player1.clickCard(context.giftedUrchin); // 1st unit of the new round, 2 - 1 = 1
                    expect(context.player1.exhaustedResourceCount - before).toBe(1);
                });

                it('does not count events or upgrades played toward the unit count', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.offworldJawa); // 1st unit, 1 - 1 = 0
                    expect(context.player1.exhaustedResourceCount).toBe(0);
                    context.player2.passAction();

                    context.player1.clickCard(context.evasiveManeuver);
                    context.player1.clickCard(context.originTreeShyyyo); // exhaust target, doesn't matter which unit
                    context.player2.passAction();

                    context.player1.clickCard(context.holdoutBlaster);
                    context.player1.clickCard(context.originTreeShyyyo); // attach target
                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.clickPrompt('Pass'); // decline the optional damage effect
                    context.player2.passAction();

                    const before = context.player1.exhaustedResourceCount;
                    context.player1.clickCard(context.notiMobilePod); // still the 2nd unit, 3 - 2 = 1
                    expect(context.player1.exhaustedResourceCount - before).toBe(1);
                });
            });

            describe('while not controlling a Kashyyyk base', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            base: 'kestro-city',
                            groundArena: ['origin-tree-shyyyo'],
                            hand: [
                                'offworld-jawa', // cost 1
                                'gifted-urchin', // cost 2
                                'noti-mobile-pod' // cost 3
                            ]
                        }
                    });
                });

                it('does not reduce the cost of any unit played this round', function() {
                    const { context } = contextRef;

                    context.player1.clickCard(context.offworldJawa); // would be 1st
                    expect(context.player1.exhaustedResourceCount).toBe(1);
                    context.player2.passAction();

                    let before = context.player1.exhaustedResourceCount;
                    context.player1.clickCard(context.giftedUrchin); // would be 2nd
                    expect(context.player1.exhaustedResourceCount - before).toBe(2);
                    context.player2.passAction();

                    before = context.player1.exhaustedResourceCount;
                    context.player1.clickCard(context.notiMobilePod); // would be 3rd
                    expect(context.player1.exhaustedResourceCount - before).toBe(3);
                });
            });
        });

        it('counts its own play toward the round\'s unit count, consuming an ordinal slot even without discounting itself', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'origin-tree',
                    hand: ['offworld-jawa', 'gifted-urchin', 'origin-tree-shyyyo', 'noti-mobile-pod']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.offworldJawa); // 1st unit, Shyyyo not in play, full price
            expect(context.player1.exhaustedResourceCount).toBe(1);
            context.player2.passAction();

            context.player1.clickCard(context.giftedUrchin); // 2nd unit, Shyyyo still not in play, full price
            expect(context.player1.exhaustedResourceCount).toBe(3); // 1 + 2
            context.player2.passAction();

            context.player1.clickCard(context.originTreeShyyyo); // 3rd unit this round; no self-discount
            expect(context.player1.exhaustedResourceCount).toBe(9); // 3 + 6
            context.player2.passAction();

            const before = context.player1.exhaustedResourceCount;
            context.player1.clickCard(context.notiMobilePod); // 4th unit overall this round; no discount remains
            expect(context.player1.exhaustedResourceCount - before).toBe(3);
        });

        it('does not count a token unit created during the round toward the unit count', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'origin-tree',
                    groundArena: ['origin-tree-shyyyo'],
                    hand: ['droid-deployment', 'noti-mobile-pod']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.droidDeployment); // creates 2 Battle Droid tokens, not a unit play
            context.player2.passAction();

            const before = context.player1.exhaustedResourceCount;
            context.player1.clickCard(context.notiMobilePod); // still the 1st unit played this round, 3 - 1 = 2
            expect(context.player1.exhaustedResourceCount - before).toBe(2);
        });

        it('does not count a leader deployed during the round toward the unit count', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'origin-tree',
                    leader: 'emperor-palpatine#galactic-ruler',
                    groundArena: ['origin-tree-shyyyo'],
                    hand: ['noti-mobile-pod']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.emperorPalpatine);
            context.player1.clickPrompt('Deploy Emperor Palpatine');
            context.player2.passAction();

            const before = context.player1.exhaustedResourceCount;
            context.player1.clickCard(context.notiMobilePod); // still the 1st unit played this round, 3 - 1 = 2
            expect(context.player1.exhaustedResourceCount - before).toBe(2);
        });

        describe('when a unit is played via another card\'s ability', function() {
            it('discounts and counts a unit played by a nested When Played ability, stacking with the other card\'s own discount', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        base: 'origin-tree',
                        groundArena: ['origin-tree-shyyyo'],
                        hand: ['kelleran-beq#the-sabered-hand'],
                        deck: [
                            'wampa',
                            'porg',
                            'yoda#old-master',
                            'obiwan-kenobi#following-fate',
                            'protector',
                            'the-force-is-with-me',
                            'force-throw',
                            'battlefield-marine'
                        ]
                    }
                });

                const { context } = contextRef;

                // Kelleran Beq is the 1st unit played this round: 7 - 1 (Shyyyo) = 6
                context.player1.clickCard(context.kelleranBeq);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.wampa, context.porg, context.yoda, context.obiwanKenobi],
                    invalid: [context.protector, context.theForceIsWithMe, context.forceThrow]
                });
                context.player1.clickCardInDisplayCardPrompt(context.obiwanKenobi);

                // Obi-Wan Kenobi is the 2nd unit played this round: 6 - 3 (Kelleran) - 2 (Shyyyo) = 1
                expect(context.obiwanKenobi).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(7); // 6 + 1
            });

            it('compounds Shyyyo\'s three ordinal brackets across a play that includes a nested unit play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        base: 'origin-tree',
                        groundArena: ['origin-tree-shyyyo'],
                        hand: ['kelleran-beq#the-sabered-hand', 'noti-mobile-pod'],
                        deck: [
                            'wampa',
                            'porg',
                            'yoda#old-master',
                            'obiwan-kenobi#following-fate',
                            'protector',
                            'the-force-is-with-me',
                            'force-throw',
                            'battlefield-marine'
                        ]
                    }
                });

                const { context } = contextRef;

                // Kelleran Beq is the 1st unit played this round: 7 - 1 (Shyyyo) = 6
                context.player1.clickCard(context.kelleranBeq);
                context.player1.clickCardInDisplayCardPrompt(context.obiwanKenobi);

                // Obi-Wan Kenobi is the 2nd unit played this round: 6 - 3 (Kelleran) - 2 (Shyyyo) = 1
                expect(context.player1.exhaustedResourceCount).toBe(7); // 6 + 1
                context.player2.passAction();

                // Noti Mobile Pod is the 3rd unit played this round: 3 - 3 (Shyyyo) = 0
                const before = context.player1.exhaustedResourceCount;
                context.player1.clickCard(context.notiMobilePod);
                expect(context.player1.exhaustedResourceCount - before).toBe(0);
            });
        });

        describe('interaction with Piloting', function() {
            it('discounts and counts a Pilot card that is played as a unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        base: 'origin-tree',
                        groundArena: ['origin-tree-shyyyo'],
                        hand: ['astromech-pilot', 'noti-mobile-pod']
                    }
                });

                const { context } = contextRef;

                // No friendly Vehicle is in play, so this plays directly as a unit with no play-type prompt
                context.player1.clickCard(context.astromechPilot); // 1st unit, 1 - 1 = 0
                expect(context.player1.exhaustedResourceCount).toBe(0);
                context.player2.passAction();

                const before = context.player1.exhaustedResourceCount;
                context.player1.clickCard(context.notiMobilePod); // 2nd unit, 3 - 2 = 1
                expect(context.player1.exhaustedResourceCount - before).toBe(1);
            });

            it('does not discount or count a Pilot card played as an upgrade via Piloting', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        base: 'origin-tree',
                        groundArena: ['origin-tree-shyyyo'],
                        spaceArena: ['headhunter-squadron'],
                        hand: ['astromech-pilot', 'noti-mobile-pod']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.astromechPilot);
                context.player1.clickPrompt('Play Astromech Pilot with Piloting');
                expect(context.player1).toBeAbleToSelectExactly([context.headhunterSquadron]);
                context.player1.clickCard(context.headhunterSquadron);

                // No unit is damaged, so the optional "heal 2 damage" effect has no eligible target and resolves without a prompt
                expect(context.player2).toBeActivePlayer();

                // Piloting cost is unaffected by Shyyyo, since it is played as an upgrade, not a unit
                expect(context.player1.exhaustedResourceCount).toBe(2);
                context.player2.passAction();

                // Noti Mobile Pod is still the 1st unit played this round, since the Piloting play didn't count
                const before = context.player1.exhaustedResourceCount;
                context.player1.clickCard(context.notiMobilePod); // 3 - 1 = 2
                expect(context.player1.exhaustedResourceCount - before).toBe(2);
            });
        });

        it('stacks the discount from each independent copy of Origin Tree Shyyyo when two copies are in play', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'origin-tree',
                    groundArena: ['origin-tree-shyyyo', 'origin-tree-shyyyo'],
                    hand: ['noti-mobile-pod', 'bank-job-fugitives']
                }
            });

            const { context } = contextRef;

            // 1st unit played this round: two independent -1 discounts stack to -2: 3 - 2 = 1
            context.player1.clickCard(context.notiMobilePod);
            expect(context.player1.exhaustedResourceCount).toBe(1);
            context.player2.passAction();

            // 2nd unit played this round: two independent -2 discounts stack to -4: 6 - 4 = 2
            const before = context.player1.exhaustedResourceCount;
            context.player1.clickCard(context.bankJobFugitives);
            expect(context.player1.exhaustedResourceCount - before).toBe(2);
        });
    });
});
