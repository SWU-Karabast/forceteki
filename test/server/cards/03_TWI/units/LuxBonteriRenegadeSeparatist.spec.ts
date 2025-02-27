describe('Lux Bonteri, Renegade Separatist', function () {
    integration(function (contextRef) {
        it('Lux Bonteri\'s ability should ready or exhaust a unit when opponent play a unit with decreased cost', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['droideka-security', 'scout-bike-pursuer', 'palpatines-return', 'krayt-dragon', 'clone'],
                    groundArena: ['battlefield-marine', { card: 'huyang#enduring-instructor', upgrades: ['generals-blade'] }],
                    resources: 45,
                    base: 'echo-base',
                    leader: 'iden-versio#inferno-squad-commander'
                },
                player2: {
                    hand: ['youre-my-only-hope'],
                    groundArena: ['lux-bonteri#renegade-separatist'],
                    leader: 'chewbacca#walking-carpet',
                    deck: ['kiadimundi#composed-and-confident']
                },
            });

            const { context } = contextRef;

            // play a unit without decreased cost, nothing happens
            context.player1.clickCard(context.scoutBikePursuer);

            expect(context.scoutBikePursuer).toBeInZone('groundArena');
            expect(context.player2).toBeActivePlayer();

            context.player1.moveCard(context.scoutBikePursuer, 'hand');

            context.player2.clickCard(context.youreMyOnlyHope);
            context.player2.clickDisplayCardPromptButton(context.kiadimundi.uuid, 'play-discount');

            // player 2 play a unit with decreased cost, nothing happens

            expect(context.player1).toBeActivePlayer();

            // play a unit with exploit (decreased cost)
            context.player1.clickCard(context.droidekaSecurity);
            context.player1.clickPrompt('Trigger exploit');
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickPrompt('Done');

            // droideka security was played with only 4 resource, lux ability triggers
            expect(context.player2).toBeAbleToSelectExactly([context.luxBonteri, context.kiadimundi, context.droidekaSecurity, context.huyang]);

            // ready a unit
            context.player2.clickCard(context.droidekaSecurity);
            expect(context.player2).toHaveExactPromptButtons(['Exhaust', 'Ready']);
            context.player2.clickPrompt('Ready');

            expect(context.droidekaSecurity.exhausted).toBeFalse();
            expect(context.player2).toBeActivePlayer();

            context.player2.passAction();

            // trigger general balde
            context.player1.clickCard(context.huyang);
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();

            // play scout bike pursuer with general blade ability
            context.player1.clickCard(context.scoutBikePursuer);

            // lux ability triggers
            expect(context.player2).toBeAbleToSelectExactly([context.luxBonteri, context.kiadimundi, context.droidekaSecurity, context.scoutBikePursuer, context.huyang]);
            context.player2.clickCard(context.droidekaSecurity);
            expect(context.player2).toHaveExactPromptButtons(['Exhaust', 'Ready']);
            context.player2.clickPrompt('Exhaust');

            expect(context.droidekaSecurity.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();
            context.player2.passAction();

            // play a unit with palpatine's return, opponent play 0 resource for the unit, lux ability should trigger
            context.player1.clickCard(context.palpatinesReturn);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeAbleToSelectExactly([context.luxBonteri, context.kiadimundi, context.droidekaSecurity, context.scoutBikePursuer, context.huyang, context.battlefieldMarine]);
            context.player2.clickCard(context.droidekaSecurity);

            // exhaust an already exhausted unit
            expect(context.player2).toHaveExactPromptButtons(['Exhaust', 'Ready']);
            context.player2.clickPrompt('Exhaust');
            expect(context.droidekaSecurity.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();

            // TODO CLONE

            // context.player2.passAction();
            // context.player1.clickCard(context.kraytDragon);
            //
            // // play clone and copy krayt dragon, you pay 7 for an 9 cost card, lux ability should trigger
            // context.player2.passAction();
            // context.player1.clickCard(context.clone);
            // context.player1.clickCard(context.kraytDragon);
            //
            // const dragons = context.player2.findCardsByName('krayt-dragon');
            //
            // expect(context.player2).toBeAbleToSelectExactly([context.luxBonteri, context.droidekaSecurity, context.scoutBikePursuer, context.huyang, context.battlefieldMarine, ...dragons]);
            // context.player2.clickCard(context.droidekaSecurity);
            // expect(context.player2).toHaveExactPromptButtons(['Exhaust', 'Ready']);
            // context.player2.clickPrompt('Exhaust');

            // TODO PILOTING
        });

        it('Lux Bonteri\'s ability should ready or exhaust a unit when opponent play a unit with decreased cost (from smuggle)', async function () {
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

            // exhaust battlefiele marine
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickPrompt('Exhaust');

            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();
        });
    });
});
