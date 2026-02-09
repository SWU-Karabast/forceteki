describe('Clarifications Checks', function() {
    integration(function(contextRef) {
        it('Oppo and Clone should not get Restore off of each other', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['oppo-rancisis#ancient-councilor', 'admiral-ackbar#brilliant-strategist'],
                    hand: ['clone']
                },
                player2: {
                    hand: ['takedown']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.clone);
            context.player1.clickCard(context.oppoRancisis);

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.admiralAckbar);

            expect(context.oppoRancisis.hasSomeKeyword('restore')).toBe(false);
            expect(context.clone.hasSomeKeyword('restore')).toBe(false);
        });

        it('should nest krayt with when played and have yoda resolve last', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['yoda#my-ally-is-the-force'],
                    hand: ['ahsoka-tano#chasing-whispers'],
                    leader: 'quigon-jinn#student-of-the-living-force',
                    hasForceToken: true
                },
                player2: {
                    groundArena: ['krayt-dragon'],
                    hand: ['daring-raid']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.quigonJinn);
            context.player1.clickPrompt('Return a friendly non-leader unit to its owner\'s hand. If you do, play a non-Villainy unit that costs less than the returned unit for free');
            context.player1.clickCard(context.yoda);
            context.player1.clickCard(context.ahsokaTano);
            // AP should now be able to choose between their triggers and opponent triggers
            context.player1.clickPrompt('You');
            expect(context.player2).toBeAbleToSelectExactly(context.daringRaid);
            context.player2.clickCard(context.daringRaid);

            // Now Krayt
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.ahsokaTano]);
            context.player2.clickCard(context.p1Base);

            // Now Yoda
            context.player1.clickCard(context.kraytDragon);

            expect(context.p1Base.damage).toBe(4);
            expect(context.kraytDragon.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should keep cards captured by a pilot captured by the upgrade if the pilot is grabbed with Corvus', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'iden-versio#adapt-or-die', capturedUnits: ['secretive-sage'] }, 'admiral-ackbar#brilliant-strategist'],
                    hand: ['corvus#inferno-squadron-raider']
                },
                player2: {
                    hand: ['takedown']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.corvus);
            context.player1.clickCard(context.idenVersio);

            expect(context.corvus).toHaveExactUpgradeNames(['shield', 'iden-versio#adapt-or-die']);
            expect(context.secretiveSage).not.toBeInZone('groundArena');
            expect(context.secretiveSage).toBeCapturedBy(context.idenVersio);
        });

        it('should keep cards captured by a pilot captured by L3 if the replacement effect is used', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'l337#get-out-of-my-seat', capturedUnits: ['secretive-sage'] }, 'admiral-ackbar#brilliant-strategist'],
                    spaceArena: ['corvus#inferno-squadron-raider']
                },
                player2: {
                    hand: ['takedown'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.l337);

            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.corvus);

            expect(context.corvus).toHaveExactUpgradeNames(['l337#get-out-of-my-seat']);
            expect(context.secretiveSage).not.toBeInZone('groundArena');
            expect(context.secretiveSage).toBeCapturedBy(context.l337);
        });

        it('should allow damaging an enemy unit even if there are no friendly units in the arena', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['corvus#inferno-squadron-raider', 'cartel-spacer'],
                    hand: ['reckless-torrent']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.recklessTorrent);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefielMarine.damage).toBe(2);
        });

        it('JTL Yularen should only affect the units of his owner, not controller', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['corvus#inferno-squadron-raider', 'cartel-spacer'],
                    hand: ['admiral-yularen#fleet-coordinator']
                },
                player2: {
                    spaceArena: ['awing'],
                    hand: ['traitorous']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.admiralYularen);
            context.player1.clickPrompt('Sentinel');
            expect(context.corvus.hasSomeKeyword('sentinel')).toBe(true);
            expect(context.cartelSpacer.hasSomeKeyword('sentinel')).toBe(true);
            expect(context.awing.hasSomeKeyword('sentinel')).toBe(false);

            context.player2.clickCard(context.traitorous);
            context.player2.clickCard(context.admiralYularen);
            expect(context.corvus.hasSomeKeyword('sentinel')).toBe(true);
            expect(context.cartelSpacer.hasSomeKeyword('sentinel')).toBe(true);
            expect(context.awing.hasSomeKeyword('sentinel')).toBe(false);
        });

        it('Survivor\'s Gauntlet controller should not be able to move an enemy pilot from a unit they took control of', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['corvus#inferno-squadron-raider', 'cartel-spacer'],
                    hand: ['clone-pilot']

                },
                player2: {
                    spaceArena: [{ card: 'awing', upgrades: ['legal-authority'] }, 'survivors-gauntlet'],
                    hand: ['traitorous']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.clonePilot);
            context.player1.clickPrompt('Play Clone Pilot with piloting');
            context.player1.clickCard(context.cartelSpacer);

            context.player2.clickCard(context.traitorous);
            context.player2.clickCard(context.cartelSpacer);
            context.player1.clickPrompt('Claim initiative');

            context.player2.clickCard(context.survivorsGauntlet);
            context.player2.clickCard(context.p1Base);
            expect(context.player2).toBeAbleToSelectExactly([context.legalAuthority, context.traitorous]);
            context.player1.clickPrompt('Pass');
        });

        it('should give the Hondo Experience after ambush from timely resolves', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['corvus#inferno-squadron-raider', 'cartel-spacer'],
                    hand: ['clone-pilot'],
                    leader: 'hondo-ohnaka#thats-good-business',
                    resources: ['timely-intervention', 'daring-raid', 'wampa', 'wampa', 'wampa']

                },
                player2: {
                    spaceArena: [{ card: 'awing', upgrades: ['legal-authority'] }, 'survivors-gauntlet'],
                    groundArena: ['battlefield-marine'],
                    hand: ['traitorous']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.timelyIntervention);
            context.player1.clickCard(context.clonePilot);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickPrompt('Exhaust this leader to give an Experience token to a unit');
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.corvus);

            expect(context.corvus).toHaveExactUpgradeNames(['experience']);
            expect(context.battlefieldMarine.damage).toBe(2);
            expect(context.clonePilot).toBeInZone('discard');
            expect(context.player1).toBeActivePlayer();
        });

        it('should return Luke pilot to his owner\'s ground arena after changing control and being defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['cartel-spacer'],
                    groundArena: ['luke-skywalker#you-still-with-me'],
                    hand: ['confiscate'],
                    leader: 'hondo-ohnaka#thats-good-business',
                    resources: ['timely-intervention', 'daring-raid', 'wampa', 'wampa', 'wampa']

                },
                player2: {
                    spaceArena: [{ card: 'awing', upgrades: ['legal-authority'] }, 'survivors-gauntlet'],
                    groundArena: ['battlefield-marine'],
                    hand: ['traitorous', 'corvus#inferno-squadron-raider'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.traitorous);
            context.player2.clickCard(context.lukeSkywalker);
            context.player1.passAction();

            context.player2.clickCard(context.corvus);
            context.player2.clickCard(context.lukeSkywalker);

            context.player1.clickCard(context.confiscate);
            context.player1.clickCard(context.lukeSkywalker);
            context.player1.clickPrompt('Trigger');
            expect(context.lukeSkywalker).toBeInZone('groundArena', context.player1);
            expect(context.player2).toBeActivePlayer();
        });
    });
});