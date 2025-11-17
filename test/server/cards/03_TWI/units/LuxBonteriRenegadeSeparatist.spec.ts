describe('Lux Bonteri, Renegade Separatist', function () {
    integration(function (contextRef) {
        describe('Lux Bonteri\'s ability', function () {
            it('should not ready or exhaust a unit when opponent play a unit without decreased cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['scout-bike-pursuer'],
                        leader: 'iden-versio#inferno-squad-commander',
                        base: 'echo-base',
                    },
                    player2: {
                        groundArena: ['lux-bonteri#renegade-separatist'],
                    },
                });

                const { context } = contextRef;

                // play a unit without decreased cost, nothing happens
                context.player1.clickCard(context.scoutBikePursuer);

                expect(context.scoutBikePursuer).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not ready or exhaust a unit when player play a unit with decreased cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player2: {
                        hand: ['youre-my-only-hope'],
                        groundArena: ['lux-bonteri#renegade-separatist'],
                        leader: 'chewbacca#walking-carpet',
                        deck: ['kiadimundi#composed-and-confident'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                // player 2 play a unit with decreased cost, nothing happens
                context.player2.clickCard(context.youreMyOnlyHope);
                context.player2.clickDisplayCardPromptButton(context.kiadimundi.uuid, 'play-discount');

                expect(context.player1).toBeActivePlayer();
            });

            it('should ready or exhaust a unit when opponent play a unit with decreased cost (from exploit)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['droideka-security'],
                        groundArena: ['battlefield-marine', 'huyang#enduring-instructor'],
                        base: 'echo-base',
                        leader: 'iden-versio#inferno-squad-commander'
                    },
                    player2: {
                        groundArena: ['lux-bonteri#renegade-separatist'],
                    },
                });

                const { context } = contextRef;

                // play a unit with exploit (decreased cost)
                context.player1.clickCard(context.droidekaSecurity);
                context.player1.clickPrompt('Trigger exploit');
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickDone();

                // droideka security was played with only 4 resource, lux ability triggers
                expect(context.player2).toBeAbleToSelectExactly([context.luxBonteri, context.droidekaSecurity, context.huyang]);

                // ready a unit
                context.player2.clickCard(context.droidekaSecurity);
                expect(context.player2).toHaveExactPromptButtons(['Exhaust', 'Ready']);
                context.player2.clickPrompt('Ready');

                expect(context.droidekaSecurity.exhausted).toBeFalse();
            });

            it('should ready or exhaust a unit when opponent play a unit with decreased cost (from lasting effect)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['scout-bike-pursuer'],
                        groundArena: [{ card: 'huyang#enduring-instructor', upgrades: ['generals-blade'] }],
                        base: 'echo-base',
                        leader: 'iden-versio#inferno-squad-commander'
                    },
                    player2: {
                        groundArena: ['lux-bonteri#renegade-separatist'],
                    },
                }); const { context } = contextRef;

                // trigger general blade
                context.player1.clickCard(context.huyang);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // play scout bike pursuer with general blade ability
                context.player1.clickCard(context.scoutBikePursuer);

                // lux ability triggers
                expect(context.player2).toBeAbleToSelectExactly([context.luxBonteri, context.scoutBikePursuer, context.huyang]);
                context.player2.clickCard(context.luxBonteri);
                expect(context.player2).toHaveExactPromptButtons(['Exhaust', 'Ready']);
                context.player2.clickPrompt('Exhaust');

                expect(context.luxBonteri.exhausted).toBeTrue();
            });

            it('should ready or exhaust a unit when opponent play a unit with decreased cost (from discard)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['palpatines-return'],
                        groundArena: ['huyang#enduring-instructor'],
                        discard: ['battlefield-marine'],
                        base: 'echo-base',
                        leader: 'iden-versio#inferno-squad-commander'
                    },
                    player2: {
                        groundArena: ['lux-bonteri#renegade-separatist'],
                    },
                });
                const { context } = contextRef;

                // play a unit with palpatine's return, opponent play 0 resource for the unit, lux ability should trigger
                context.player1.clickCard(context.palpatinesReturn);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeAbleToSelectExactly([context.luxBonteri, context.huyang, context.battlefieldMarine]);
                context.player2.clickCard(context.battlefieldMarine);

                // exhaust an already exhausted unit
                expect(context.player2).toHaveExactPromptButtons(['Exhaust', 'Ready']);
                context.player2.clickPrompt('Exhaust');
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should ready or exhaust a unit when opponent play Clone which copy a higher cost unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['krayt-dragon', 'clone'],
                        groundArena: ['huyang#enduring-instructor'],
                        base: 'echo-base',
                        leader: 'iden-versio#inferno-squad-commander'
                    },
                    player2: {
                        groundArena: ['lux-bonteri#renegade-separatist'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.kraytDragon);
                context.player2.passAction();

                // play clone and copy krayt dragon, you pay 7 for an 9 cost card, lux ability should trigger
                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.kraytDragon);

                expect(context.player2).toBeAbleToSelectExactly([context.luxBonteri, context.huyang, context.kraytDragon, context.clone]);
                context.player2.clickCard(context.huyang);
                expect(context.player2).toHaveExactPromptButtons(['Exhaust', 'Ready']);
                context.player2.clickPrompt('Exhaust');

                expect(context.huyang.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should ready or exhaust a unit when opponent play a Pilot which costs less than his normal cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['tam-ryvora#searching-for-purpose'],
                        spaceArena: ['awing'],
                        base: 'echo-base',
                        leader: 'iden-versio#inferno-squad-commander'
                    },
                    player2: {
                        groundArena: ['lux-bonteri#renegade-separatist'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tamRyvora);
                context.player1.clickPrompt('Play Tam Ryvora with Piloting');
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeAbleToSelectExactly([context.luxBonteri, context.awing]);
                context.player2.clickCard(context.awing);
                expect(context.player2).toHaveExactPromptButtons(['Exhaust', 'Ready']);
                context.player2.clickPrompt('Exhaust');

                expect(context.awing.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should ready or exhaust a unit when opponent play a unit with decreased cost (from smuggle)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        resources: ['millennium-falcon#landos-pride', 'pyke-sentinel', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                        leader: 'lando-calrissian#with-impeccable-taste'
                    },
                    player2: {
                        groundArena: ['lux-bonteri#renegade-separatist']
                    },
                });

                const { context } = contextRef;

                // play a smuggle card with lando ability
                context.player1.clickCard(context.landoCalrissian);
                context.player1.clickPrompt('Play a card using Smuggle. It costs 2 less. Defeat a resource you own and control.');
                context.player1.clickCard(context.millenniumFalcon);
                // defeat a resource player 1 own and control
                context.player1.clickCard(context.pykeSentinel);

                // falcon was played with 4 resources, lux ability triggers
                expect(context.player2).toBeAbleToSelectExactly([context.luxBonteri, context.battlefieldMarine, context.millenniumFalcon]);

                // exhaust battlefield marine
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickPrompt('Exhaust');

                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when playing units owned by the opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['stolen-athauler'],
                    },
                    player2: {
                        hand: ['takedown'],
                        groundArena: ['lux-bonteri#renegade-separatist'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.stolenAthauler);

                context.player1.passAction();

                context.player2.clickCard(context.stolenAthauler);

                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
