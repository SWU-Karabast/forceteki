
describe('Tactical Droid Commander', function() {
    integration(function(contextRef) {
        it('should be able to exhaust a unit that costs the same or less than the played separatist', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['providence-destroyer', 'morgan-elsbeth#keeper-of-many-secrets', 'planetary-invasion'],
                    groundArena: ['tactical-droid-commander'],
                    resources: 30

                },
                player2: {
                    groundArena: ['battlefield-marine', 'plo-koon#kohtoyah', 'droid-commando', 'battle-droid'],
                    hand: ['wartime-trade-official'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                }
            });

            const { context } = contextRef;

            // play Separatist unit, able to exhaust unit of same cost or less.
            context.player1.clickCard(context.providenceDestroyer);
            context.player1.clickPrompt('Play without Exploit');
            expect(context.player1).toBeAbleToSelectExactly([context.tacticalDroidCommander, context.battlefieldMarine, context.droidCommando, context.lukeSkywalker, context.ploKoon, context.battleDroid, context.providenceDestroyer]);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine.exhausted).toBeTrue();

            context.player2.passAction();

            // play non Separatist, no trigger.
            context.player1.clickCard(context.morganElsbeth);
            expect(context.player2).toBeActivePlayer();

            // Opponent plays Separatist unit, no trigger.
            context.player2.clickCard(context.wartimeTradeOfficial);
            expect(context.player1).toBeActivePlayer();

            // Play a Separatist event, no trigger
            context.player1.clickCard(context.planetaryInvasion);
            context.player1.clickPrompt('Play without Exploit');
            context.player1.clickPrompt('Done');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
