describe('Condemn', function () {
    integration(function (contextRef) {
        const disclosePrompt = (attackerTitle: string) => `Disclose Vigilance, Villainy to give ${attackerTitle} -6/-0 for this attack`;

        describe('The gained On Attack ability targeting attached unit', function () {
            it('should allow the defending player to disclose Vigilance & Villainy to give attached unit -6/-0 for the attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'condemn',
                            'superlaser-blast'
                        ],
                        groundArena: ['awakened-specters']
                    },
                    player2: {
                        groundArena: ['ravenous-rathtar']
                    }
                });

                const { context } = contextRef;

                // Play Condemn on Ravenous Rathtar
                context.player1.clickCard(context.condemn);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.awakenedSpecters,
                    context.ravenousRathtar
                ]);
                context.player1.clickCard(context.ravenousRathtar);

                // P2 attacks Awakened Specters with Ravenous Rathtar
                context.player2.clickCard(context.ravenousRathtar);
                context.player2.clickCard(context.awakenedSpecters);

                // P1 is prompted to disclose Vigilance/Villainy
                expect(context.player1).toHavePrompt(disclosePrompt(context.ravenousRathtar.title));
                expect(context.player1).toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([
                    context.superlaserBlast
                ]);

                // P1 discloses Superlaser Blast
                context.player1.clickCard(context.superlaserBlast);

                // Cards are revealed to the opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.superlaserBlast]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickDone();

                // Attack resolves
                expect(context.awakenedSpecters.damage).toBe(2); // Ravenous Rathtar deals 2 damage due to -6 power
                expect(context.ravenousRathtar.damage).toBe(4);
            });

            it('is automatically skipped if the required aspects cannot be disclosed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'condemn',
                            'open-fire',
                            'i-am-your-father'
                        ],
                        groundArena: ['awakened-specters']
                    },
                    player2: {
                        groundArena: ['ravenous-rathtar']
                    }
                });

                const { context } = contextRef;

                // Play Condemn on Ravenous Rathtar
                context.player1.clickCard(context.condemn);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.awakenedSpecters,
                    context.ravenousRathtar
                ]);
                context.player1.clickCard(context.ravenousRathtar);

                // P2 attacks Awakened Specters with Ravenous Rathtar
                context.player2.clickCard(context.ravenousRathtar);
                context.player2.clickCard(context.awakenedSpecters);

                // P1 is not prompted to disclose Vigilance/Villainy
                expect(context.player1).not.toHavePrompt(disclosePrompt(context.ravenousRathtar.title));

                // Attack resolves, defeating Awakened Specters
                expect(context.awakenedSpecters).toBeInZone('discard', context.player1);
                expect(context.ravenousRathtar.damage).toBe(4);
                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('The blanking effect during the attack', function () {
            it('makes the attached unit lose constant abilities for the duration of the attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{
                            card: 'axe-woves#accomplished-warrior',
                            upgrades: [
                                'shield',
                                'condemn',
                                'experience'
                            ]
                        }]
                    }
                });

                const { context } = contextRef;

                // Sanity check Axe's power before attack
                expect(context.axeWoves.getPower()).toBe(6);

                // P1 attacks base with Axe Woves
                context.player1.clickCard(context.axeWoves);
                context.player1.clickCard(context.p2Base);

                // Axe only hits for 3 because his constant ability is removed for the attack
                expect(context.p2Base.damage).toBe(3);
            });

            it('makes the attached unit lose keyword abilities for the duration of the attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: {
                            card: 'chopper-base',
                            damage: 5
                        },
                        groundArena: [{
                            card: 'nihil-marauder',
                            upgrades: [
                                'condemn',
                                'infiltrators-skill',
                                'devotion'
                            ]
                        }]
                    },
                    player2: {
                        groundArena: [
                            'niima-outpost-constables',
                            'battlefield-marine'
                        ]
                    }
                });

                const { context } = contextRef;

                // Initiate an attack with Nihil Marauder
                context.player1.clickCard(context.nihilMarauder);

                // It loses Saboteur from Infiltrator's Skill, so the sentinel is the only valid target
                expect(context.player1).toBeAbleToSelectExactly([context.niimaOutpostConstables]);
                context.player1.clickCard(context.niimaOutpostConstables);

                // It loses Raid 3, so it only deals 3 damage instead of 6
                expect(context.niimaOutpostConstables.damage).toBe(3);

                // It loses Restore from Devotion, so base is not healed
                expect(context.p1Base.damage).toBe(5);
            });

            xit('makes the attached unit lose triggered abilities for the duration of the attack', async function () {});

            xit('ends the effect in time for post-attack triggers', async function () {});

            xit('results in full blanking when multiple Condemn upgrades are attached', async function () {});

            xit('results in full blanking when combined with Exiled From the Force', async function () {});

            xit('does not affect the attached unit when there is a separate full blanking effect being applied', async function () {});
        });
    });
});