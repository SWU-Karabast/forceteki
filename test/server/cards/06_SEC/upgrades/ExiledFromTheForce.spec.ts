describe('Exiled From the Force', function () {
    integration(function (contextRef) {
        it('removes the Force trait from the attached unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['exiled-from-the-force', 'constructed-lightsaber'],
                    groundArena: ['secretive-sage', 'youngling-padawan']
                },
                player2: {}
            });

            const { context } = contextRef;

            // Play Exiled From the Force on Secretive Sage
            context.player1.clickCard(context.exiledFromTheForce);
            expect(context.player1).toBeAbleToSelectExactly([
                context.secretiveSage,
                context.younglingPadawan
            ]);
            context.player1.clickCard(context.secretiveSage);

            context.player2.passAction();

            // Play Constructed Lightsaber
            context.player1.clickCard(context.constructedLightsaber);
            expect(context.player1).toBeAbleToSelectExactly([
                // Secretive Sage no longer has the Force trait, so its not a valid target
                context.younglingPadawan
            ]);
            context.player1.clickCard(context.younglingPadawan);
        });

        it('removes all keyword abilities except Grit from the attached unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['exiled-from-the-force'],
                    spaceArena: ['home-one#alliance-flagship'],
                    groundArena: [
                        {
                            card: 'jedi-guardian',
                            damage: 4,
                            upgrades: [
                                'protector',
                                'inspiring-mentor'
                            ]
                        }
                    ]
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            // Sanity check - Jedi Guardian should have 6 power, Sentinel and Restore 1
            expect(context.jediGuardian.getPower()).toBe(6);
            expect(context.jediGuardian.hasSomeKeyword('grit')).toBeFalse();
            expect(context.jediGuardian.hasSomeKeyword('sentinel')).toBeTrue();
            expect(context.jediGuardian.hasSomeKeyword('restore')).toBeTrue();

            // Play Exiled From the Force on Jedi Guardian
            context.player1.clickCard(context.exiledFromTheForce);
            expect(context.player1).toBeAbleToSelectExactly([context.jediGuardian, context.homeOne, context.atst]);
            context.player1.clickCard(context.jediGuardian);

            // Jedi Guardian now has Grit but loses Sentinel and Restore 1
            expect(context.jediGuardian.getPower()).toBe(10);
            expect(context.jediGuardian.hasSomeKeyword('grit')).toBeTrue();
            expect(context.jediGuardian.hasSomeKeyword('sentinel')).toBeFalse();
            expect(context.jediGuardian.hasSomeKeyword('restore')).toBeFalse();

            // P2 can attack base with AT-ST because Jedi Guardian no longer has Sentinel
            context.player2.clickCard(context.atst);
            expect(context.player2).toBeAbleToSelect(context.p1Base);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(6);

            // Jedi Guardian attacks base
            context.player1.clickCard(context.jediGuardian);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(10);
            expect(context.p1Base.damage).toBe(6); // No damage restored
            expect(context.homeOne.upgrades.length).toBe(0); // No experience given from Inspiring Mentor's ability
            expect(context.player2).toBeActivePlayer();
        });

        it('removes all constant abilities from the attached unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [
                        {
                            card: 'oggdo-bogdo#bogano-brute',
                            upgrades: [
                                'exiled-from-the-force',
                                'shadowed-intentions'
                            ]
                        }
                    ]
                },
                player2: {
                    hand: ['vanquish']
                }
            });

            const { context } = contextRef;

            // Oggdo Bogdo can attack without any damage on him
            context.player1.clickCard(context.oggdoBogdo);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(5);

            // Oggdo Bogdo can be defeated because the gained ability from Shadowed Intentions is removed
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.oggdoBogdo);
            expect(context.oggdoBogdo).toBeInZone('discard');
        });

        it('removes all triggered abilities from the attached unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['heroic-sacrifice'],
                    deck: ['resupply', 'emperors-royal-guard'],
                    groundArena: [
                        {
                            card: 'reinforcement-walker',
                            upgrades: [
                                'exiled-from-the-force',
                                'ruthlessness'
                            ]
                        }
                    ]
                },
                player2: {
                    groundArena: [
                        'war-juggernaut'
                    ]
                }
            });

            const { context } = contextRef;

            // Play Heroic Sacrifice to draw a card then attack with Reinforcement Walker
            context.player1.clickCard(context.heroicSacrifice);
            context.player1.clickCard(context.reinforcementWalker);
            context.player1.clickCard(context.warJuggernaut);

            // Attack is over, no ability triggered
            expect(context.player2).toBeActivePlayer();
            expect(context.reinforcementWalker).toBeInZone('groundArena'); // No Heroic Sacrifice defeat
            expect(context.p2Base.damage).toBe(0); // No Ruthlessness damage
            expect(context.emperorsRoyalGuard).toBeInZone('deck'); // No Walker draw/discard
        });

        it('does not give Grit if the the unit loses all abilities from another effect', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                    hand: ['exiled-from-the-force'],
                    groundArena: [
                        {
                            card: 'jedi-guardian',
                            damage: 4
                        }
                    ]
                },
            });

            const { context } = contextRef;

            // Use Kazuda to remove all abilities from Jedi Guardian and play Exiled From the Force on it
            context.player1.clickCard(context.kazudaXiono);
            context.player1.clickPrompt('Remove all abilities from a friendly unit, then take another action');
            context.player1.clickCard(context.jediGuardian);

            context.player1.clickCard(context.exiledFromTheForce);
            context.player1.clickCard(context.jediGuardian);

            // Jedi Guardian does not gain Grit because it lost all abilities from Kazuda Xiono's ability
            expect(context.jediGuardian.getPower()).toBe(4);
            expect(context.jediGuardian.hasSomeKeyword('grit')).toBeFalse();

            context.player2.passAction();

            // Jedi Guardian attacks base
            context.player1.clickCard(context.jediGuardian);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(4);
        });

        it('still has Grit if it gains grit from other sources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['exiled-from-the-force'],
                    groundArena: [{ card: 'lost-jedi', damage: 2 }],
                    spaceArena: ['first-light#headquarters-of-the-crimson-dawn']
                }
            });

            const { context } = contextRef;

            // Lost Jedi already has Grit
            expect(context.lostJedi.getPower()).toBe(3);
            expect(context.lostJedi.hasSomeKeyword('grit')).toBeTrue();

            // Play Exiled From the Force on Lost Jedi
            context.player1.clickCard(context.exiledFromTheForce);
            context.player1.clickCard(context.lostJedi);

            // Lost Jedi still has Grit
            expect(context.lostJedi.getPower()).toBe(3);
            expect(context.lostJedi.hasSomeKeyword('grit')).toBeTrue();

            context.player2.passAction();

            // Lost Jedi attacks base
            context.player1.clickCard(context.lostJedi);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(3);
        });

        it('interacts correctly with effects that remove keywords', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{
                        card: 'jedi-guardian',
                        damage: 4,
                        upgrades: ['exiled-from-the-force']
                    }]
                },
                player2: {
                    spaceArena: ['screeching-tie-fighter'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            // Jedi Guardian should have Grit from Exiled From the Force
            expect(context.jediGuardian.getPower()).toBe(8);
            expect(context.jediGuardian.hasSomeKeyword('grit')).toBeTrue();

            // Attack with Screeching TIE to remove keywords from Jedi Guardian
            context.player2.clickCard(context.screechingTieFighter);
            context.player2.clickCard(context.p1Base);
            context.player2.clickCard(context.jediGuardian);

            // Jedi Guardian no longer has Grit
            expect(context.jediGuardian.getPower()).toBe(4);
            expect(context.jediGuardian.hasSomeKeyword('grit')).toBeFalse();

            context.player1.clickCard(context.jediGuardian);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(4);
        });

        it('still has grit if there are multiple copies of Exiled From the Force attached', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{
                        card: 'jedi-guardian',
                        damage: 4,
                        upgrades: [
                            'exiled-from-the-force',
                            'exiled-from-the-force'
                        ]
                    }]
                }
            });

            const { context } = contextRef;

            // Jedi Guardian should have Grit from Exiled From the Force
            expect(context.jediGuardian.getPower()).toBe(8);
            expect(context.jediGuardian.hasSomeKeyword('grit')).toBeTrue();

            context.player1.clickCard(context.jediGuardian);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(8);
        });
    });
});