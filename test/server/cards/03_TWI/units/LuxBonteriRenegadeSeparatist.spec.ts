describe('Lux Bonteri, Renegade Separatist', function () {
    integration(function (contextRef) {
        it('should create 2 Clone Tropper tokens when defeated', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['droideka-security', 'scout-bike-pursuer', 'palpatines-return', 'krayt-dragon', 'clone'],
                    groundArena: ['battlefield-marine', { card: 'huyang#enduring-instructor', upgrades: ['generals-blade'] }],
                    resources: 45,
                    base: 'echo-base',
                    leader: 'iden-versio#inferno-squad-commander'
                },
                player2: {
                    groundArena: ['lux-bonteri#renegade-separatist']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.scoutBikePursuer);

            expect(context.scoutBikePursuer).toBeInZone('groundArena');
            expect(context.player2).toBeActivePlayer();

            context.player1.moveCard(context.scoutBikePursuer, 'hand');

            context.player2.passAction();

            context.player1.clickCard(context.droidekaSecurity);
            context.player1.clickPrompt('Play Droideka Security using Exploit');
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickPrompt('Done');

            expect(context.player2).toBeAbleToSelectExactly([context.luxBonteri, context.droidekaSecurity, context.huyang]);
            context.player2.clickCard(context.droidekaSecurity);
            expect(context.player2).toHaveExactPromptButtons(['Exhaust', 'Ready']);
            context.player2.clickPrompt('Ready');

            expect(context.player2).toBeActivePlayer();
            expect(context.droidekaSecurity.exhausted).toBeFalse();

            context.player2.passAction();

            context.player1.clickCard(context.huyang);
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();

            context.player1.clickCard(context.scoutBikePursuer);
            expect(context.player2).toBeAbleToSelectExactly([context.luxBonteri, context.droidekaSecurity, context.scoutBikePursuer, context.huyang]);
            context.player2.clickCard(context.droidekaSecurity);
            expect(context.player2).toHaveExactPromptButtons(['Exhaust', 'Ready']);
            context.player2.clickPrompt('Exhaust');

            context.player2.passAction();

            context.player1.clickCard(context.palpatinesReturn);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeAbleToSelectExactly([context.luxBonteri, context.droidekaSecurity, context.scoutBikePursuer, context.huyang, context.battlefieldMarine]);
            context.player2.clickCard(context.droidekaSecurity);
            expect(context.player2).toHaveExactPromptButtons(['Exhaust', 'Ready']);
            context.player2.clickPrompt('Exhaust');

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
    });
});
