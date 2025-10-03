describe('Damage Prevention Effects', function() {
    integration(function(contextRef) {
        describe('A unit that ignores all damage from enemy card abilities', function() {
            it('cannot be damaged by opponent\'s event', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid'],
                    },
                    player2: {
                        spaceArena: ['lurking-tie-phantom'],
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.lurkingTiePhantom);
                expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
                expect(context.lurkingTiePhantom.damage).toBe(0);

                expect(context.getChatLogs(3)).toContain('player2 uses Lurking TIE Phantom to prevent all damage to Lurking TIE Phantom');
            });

            it('cannot be damaged by enemy unit ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['imperial-interceptor'],
                    },
                    player2: {
                        spaceArena: ['lurking-tie-phantom'],
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.imperialInterceptor);
                context.player1.clickCard(context.lurkingTiePhantom);
                expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
                expect(context.lurkingTiePhantom.damage).toBe(0);
                expect(context.getChatLogs(3)).toContain('player2 uses Lurking TIE Phantom to prevent all damage to Lurking TIE Phantom');
            });

            it('can be damaged by your own event', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['open-fire'],
                        spaceArena: ['lurking-tie-phantom'],
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.lurkingTiePhantom);
                expect(context.lurkingTiePhantom).toBeInZone('discard');
                expect(context.getChatLogs(3)).not.toContain('player2 uses Lurking TIE Phantom to prevent all damage to Lurking TIE Phantom');
            });

            it('can be damaged by your own unit ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['devastator#inescapable'],
                        spaceArena: ['lurking-tie-phantom'],
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.devastator);
                context.player1.clickCard(context.lurkingTiePhantom);
                expect(context.lurkingTiePhantom).toBeInZone('discard');
                expect(context.getChatLogs(3)).not.toContain('player2 uses Lurking TIE Phantom to prevent all damage to Lurking TIE Phantom');
            });

            it('cannot be damaged by opponent ability even if you pick', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['power-of-the-dark-side'],
                    },
                    player2: {
                        spaceArena: ['lurking-tie-phantom', 'devastator#inescapable'],
                        groundArena: ['battlefield-marine', 'count-dooku#darth-tyranus'],
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.powerOfTheDarkSide);
                expect(context.player2).toBeAbleToSelectExactly([context.lurkingTiePhantom, context.battlefieldMarine, context.countDooku, context.devastator]);
                context.player2.clickCard(context.lurkingTiePhantom);
                expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
                expect(context.getChatLogs(3)).not.toContain('player2 uses Lurking TIE Phantom to prevent all damage to Lurking TIE Phantom');
            });

            it('can be damaged by indirect damage, it will not be immune', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['first-order-stormtrooper'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['lurking-tie-phantom'],
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.firstOrderStormtrooper);
                context.player1.clickCard(context.wampa);

                context.player1.clickPrompt('Deal indirect damage to opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.lurkingTiePhantom, 1],
                ]));

                expect(context.lurkingTiePhantom.damage).toBe(1);

                context.player1.clickPrompt('Deal indirect damage to opponent');
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.lurkingTiePhantom, 1],
                ]));

                expect(context.lurkingTiePhantom).toBeInZone('discard');
                expect(context.getChatLogs(3)).not.toContain('player2 uses Lurking TIE Phantom to prevent all damage to Lurking TIE Phantom');
            });

            it('should be immune to friendly Val\'s bounty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['val#loyal-to-the-end'],
                        spaceArena: ['lurking-tie-phantom'],
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.val);

                context.player1.clickPrompt('Opponent');
                context.player2.clickCard(context.lurkingTiePhantom);

                context.player1.clickCard(context.lurkingTiePhantom);

                expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
                expect(context.lurkingTiePhantom.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
                expect(context.getChatLogs(3)).toContain('player2 uses Lurking TIE Phantom to prevent all damage to Lurking TIE Phantom');
            });
        });

        describe('A unit that reduces damage from enemy card abilities', function() {
            it('should prevent 2 damage from enemy event', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['blood-sport'],
                        groundArena: ['battlefield-marine', 'consular-security-force']
                    },
                    player2: {
                        groundArena: ['resourceful-pursuers', 'cargo-juggernaut', 'cassian-andor#lay-low', 'val#loyal-to-the-end']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bloodSport);

                expect(context.resourcefulPursuers.damage).toBe(2);
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.consularSecurityForce.damage).toBe(2);
                expect(context.cargoJuggernaut.isUpgraded()).toBeFalse();
                expect(context.cassianAndorLayLow.damage).toBe(0);
                expect(context.valLoyalToTheEnd.damage).toBe(2);

                expect(context.getChatLogs(3)).toContain('player2 uses Cassian Andor to prevent 2 damage to Cassian Andor');
            });

            it('should prevent only 2 damage from enemy event', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['open-fire'],
                    },
                    player2: {
                        groundArena: ['cassian-andor#lay-low']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.cassianAndorLayLow);

                expect(context.cassianAndor).toBeInZone('discard');

                expect(context.getChatLogs(3)).toContain('player2 uses Cassian Andor to prevent 2 damage to Cassian Andor');
            });

            it('should not prevent damage from friendly card abilities', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {},
                    player2: {
                        hand: ['daring-raid'],
                        groundArena: ['cassian-andor#lay-low']
                    }
                });

                const { context } = contextRef;

                context.player1.clickPrompt('Pass');

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.cassianAndorLayLow);

                expect(context.cassianAndorLayLow).toBeInZone('discard');

                expect(context.getChatLogs(3)).not.toContain('player2 uses Cassian Andor to prevent 2 damage to Cassian Andor');
            });

            it('should not prevent indirect damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['torpedo-barrage'],
                    },
                    player2: {
                        groundArena: ['cassian-andor#lay-low']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.torpedoBarrage);
                context.player1.clickPrompt('Deal indirect damage to opponent');

                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.p2Base, 3],
                    [context.cassianAndorLayLow, 2],
                ]));

                expect(context.cassianAndorLayLow).toBeInZone('discard');

                expect(context.getChatLogs(3)).not.toContain('player2 uses Cassian Andor to prevent 2 damage to Cassian Andor');
            });

            it('should prevent damage to prevent defeating shield', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['blood-sport'],
                    },
                    player2: {
                        hand: ['covering-the-wing'],
                        groundArena: ['cassian-andor#lay-low']
                    }
                });

                const { context } = contextRef;

                context.player1.clickPrompt('Pass');

                context.player2.clickCard(context.coveringTheWing);
                context.player2.clickPrompt('Trigger');
                context.player2.clickCard(context.cassianAndorLayLow);

                context.player1.clickCard(context.bloodSport);

                context.player2.clickPrompt('If an enemy card ability would do damage to this unit, prevent 2 of that damage');

                expect(context.cassianAndorLayLow).toHaveExactUpgradeNames(['shield']);

                expect(context.player2).toBeActivePlayer();

                expect(context.getChatLogs(3)).toContain('player2 uses Cassian Andor to prevent 2 damage to Cassian Andor');
            });

            it('should prevent damage from Val Bounty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['open-fire'],
                    },
                    player2: {
                        groundArena: ['cassian-andor#lay-low', 'val#loyal-to-the-end']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.openFire);
                context.player1.clickCard(context.valLoyalToTheEnd);
                context.player1.clickPrompt('You');
                context.player1.clickCard(context.cassianAndorLayLow);
                context.player2.clickCard(context.cassianAndorLayLow);

                expect(context.cassianAndorLayLow.damage).toBe(1);

                expect(context.getChatLogs(3)).toContain('player2 uses Cassian Andor to prevent 2 damage to Cassian Andor');
            });

            it('should not prevent damage from Val Bounty after Val changes control', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['change-of-heart'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['power-of-the-dark-side'],
                        groundArena: ['cassian-andor#lay-low', 'val#loyal-to-the-end']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.valLoyalToTheEnd);

                context.player2.clickCard(context.powerOfTheDarkSide);
                context.player1.clickCard(context.valLoyalToTheEnd);

                context.player2.clickPrompt('You');
                context.player2.clickCard(context.cassianAndorLayLow);
                expect(context.cassianAndorLayLow).toBeInZone('discard');

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.getChatLogs(3)).not.toContain('player2 uses Cassian Andor to prevent 2 damage to Cassian Andor');
            });

            describe('A unit that replaces combat damage with a replacement effect', function() {
                it('should resolve its replaceWith (in this case, dealing combat damage to the selected Underworld unit)', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['heroic-sacrifice'],
                            groundArena: [
                                { card: 'maul#shadow-collective-visionary', upgrades: ['resilient'] },
                                'mercenary-company',
                                'greedo#slow-on-the-draw',
                                'tarfful#kashyyyk-chieftain',
                                'krrsantan#muscle-for-hire'
                            ],
                            spaceArena: ['tieln-fighter', 'cartel-spacer']
                        },
                        player2: {
                            groundArena: [
                                'luminara-unduli#softspoken-master',
                                'enterprising-lackeys',
                                'tarfful#kashyyyk-chieftain'
                            ]
                        }
                    });

                    const { context } = contextRef;

                    const p1Tarfful = context.player1.findCardByName('tarfful#kashyyyk-chieftain');
                    const p2Tarfful = context.player2.findCardByName('tarfful#kashyyyk-chieftain');

                    const reset = (pass = true) => {
                        context.setDamage(context.luminaraUnduli, 0);
                        context.setDamage(context.maul, 0);
                        context.setDamage(context.mercenaryCompany, 0);
                        context.readyCard(context.maul);

                        if (pass) {
                            context.player2.passAction();
                        }
                    };

                    // CASE 1: Maul redirects damage onto Mercenary Company
                    context.player1.clickCard(context.maul);
                    context.player1.clickCard(context.luminaraUnduli);

                    // damage redirect target selection
                    expect(context.player1).toBeAbleToSelectExactly([context.mercenaryCompany, context.cartelSpacer, context.greedo, context.krrsantan]);
                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.clickCard(context.mercenaryCompany);

                    expect(context.maul.damage).toBe(0);
                    expect(context.luminaraUnduli.damage).toBe(7);
                    expect(context.mercenaryCompany.damage).toBe(4);
                    expect(context.getChatLogs(1)).toContain('player1 uses Maul to deal 4 combat damage to Mercenary Company instead of taking damage');

                    reset(false);

                    // CASE 2: Maul is attacked, ability should be gone
                    context.player2.clickCard(context.luminaraUnduli);
                    context.player2.clickCard(context.maul);
                    expect(context.maul.damage).toBe(4);
                    expect(context.luminaraUnduli.damage).toBe(7);
                    expect(context.player1).toBeActivePlayer();

                    reset(false);

                    // CASE 3: Maul ability only redirects combat damage (test with opponent's Tarfful ability)
                    context.player1.clickCard(context.maul);
                    context.player1.clickCard(p2Tarfful);

                    // damage redirect target selection
                    expect(context.player1).toBeAbleToSelectExactly([context.mercenaryCompany, context.cartelSpacer, context.greedo, context.krrsantan]);
                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.clickCard(context.mercenaryCompany);

                    // combat damage resolves first
                    expect(context.maul.damage).toBe(0);
                    expect(p2Tarfful.damage).toBe(7);
                    expect(context.mercenaryCompany.damage).toBe(3);

                    // Tarfful ability triggers, damage is not redirected away from Maul since it's not combat damage
                    expect(context.player2).toBeAbleToSelectExactly([context.maul, context.mercenaryCompany, context.greedo, p1Tarfful, context.krrsantan]);
                    context.player2.clickCard(context.maul);
                    expect(context.maul.damage).toBe(7);

                    reset();

                    // CASE 4: redirect damage from Maul ability still counts as combat damage (test with friendly Tarfful ability)
                    context.player1.clickCard(context.maul);
                    context.player1.clickCard(context.luminaraUnduli);

                    // damage redirect target selection
                    expect(context.player1).toBeAbleToSelectExactly([context.mercenaryCompany, context.cartelSpacer, context.greedo, context.krrsantan]);
                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.clickCard(context.krrsantan);

                    // combat damage resolves first
                    expect(context.maul.damage).toBe(0);
                    expect(context.luminaraUnduli.damage).toBe(7);
                    expect(context.krrsantan.damage).toBe(4);

                    // Tarfful ability triggers since damage to Krrsantan counts as combat damage
                    expect(context.player1).toBeAbleToSelectExactly([context.luminaraUnduli, context.enterprisingLackeys, p2Tarfful]);
                    context.player1.clickCard(context.enterprisingLackeys);
                    expect(context.enterprisingLackeys.damage).toBe(4);

                    reset();

                    // CASE 5: Maul ability doesn't trigger if no target is selected
                    context.player1.clickCard(context.maul);
                    context.player1.clickCard(context.luminaraUnduli);

                    // damage redirect prompt
                    expect(context.player1).toBeAbleToSelectExactly([context.mercenaryCompany, context.cartelSpacer, context.greedo, context.krrsantan]);
                    context.player1.clickPrompt('Pass');

                    expect(context.maul.damage).toBe(4);
                    expect(context.luminaraUnduli.damage).toBe(7);
                    expect(context.mercenaryCompany.damage).toBe(0);

                    reset();

                    // CASE 6: Maul ability doesn't prompt if attacking a base
                    context.player1.clickCard(context.maul);
                    context.player1.clickCard(context.p2Base);
                    expect(context.p2Base.damage).toBe(7);
                    expect(context.player2).toBeActivePlayer();

                    reset();

                    // CASE 7: If redirect target is defeated, "when defeated" abilities happen in the right timing window
                    context.player1.clickCard(context.maul);
                    context.player1.clickCard(context.luminaraUnduli);

                    // damage redirect target selection
                    expect(context.player1).toBeAbleToSelectExactly([context.mercenaryCompany, context.cartelSpacer, context.greedo, context.krrsantan]);
                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.clickCard(context.greedo);

                    expect(context.maul.damage).toBe(0);
                    expect(context.luminaraUnduli.damage).toBe(7);

                    expect(context.greedo).toBeInZone('discard');
                    expect(context.player1).toHavePassAbilityPrompt('Discard a card from your deck. If it\'s not a unit, deal 2 damage to a ground unit.');
                    context.player1.clickPrompt('Pass');

                    reset();

                    // CASE 8: Maul gains two temporary abilities, both of them work correctly
                    context.player1.clickCard(context.heroicSacrifice);
                    context.player1.clickCard(context.maul);
                    context.player1.clickCard(context.luminaraUnduli);

                    // damage redirect target selection
                    expect(context.player1).toBeAbleToSelectExactly([context.mercenaryCompany, context.cartelSpacer, context.krrsantan]);
                    expect(context.player1).toHavePassAbilityButton();
                    context.player1.clickCard(context.mercenaryCompany);

                    expect(context.maul).toBeInZone('discard');
                    expect(context.luminaraUnduli).toBeInZone('discard');
                    expect(context.mercenaryCompany.damage).toBe(4);
                });
            });

            describe('An upgrade that replaces damage on the attached unit with a replacement effect', function() {
                it('should resolve its replaceWith (in this case, defeat itself) to prevent damage to the attached unit', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            hand: ['vanquish'],
                            spaceArena: ['cartel-spacer']
                        },
                        player2: {
                            spaceArena: [{ card: 'tieln-fighter', upgrades: ['shield'] }]
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.cartelSpacer);
                    context.player1.clickCard(context.tielnFighter);

                    expect(context.cartelSpacer.damage).toBe(2);
                    expect(context.tielnFighter.damage).toBe(0);

                    expect(context.shield).toBeInZone('outsideTheGame');
                    expect(context.tielnFighter.isUpgraded()).toBe(false);
                    expect(context.getChatLogs(2)).toEqual([
                        'player1 attacks TIE/ln Fighter with Cartel Spacer',
                        'player2 uses Shield to defeat Shield instead of taking damage',
                    ]);

                    // second attack to confirm that shield effect is off
                    context.player2.clickCard(context.tielnFighter);
                    context.player2.clickCard(context.cartelSpacer);
                    expect(context.cartelSpacer).toBeInZone('discard');
                    expect(context.tielnFighter).toBeInZone('discard');
                });
            });
        });
    });
});
