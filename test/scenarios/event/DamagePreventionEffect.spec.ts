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
        });
    });
});
