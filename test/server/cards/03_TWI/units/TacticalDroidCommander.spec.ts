
describe('Tactical Droid Commander', function() {
    integration(function(contextRef) {
        it('should be able to exhaust a unit that costs the same or less than the played separatist', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['providence-destroyer', 'morgan-elsbeth#keeper-of-many-secrets', 'planetary-invasion', 'tactical-droid-commander'],
                    groundArena: [],
                    resources: 35

                },
                player2: {
                    groundArena: ['battlefield-marine', 'plo-koon#kohtoyah', 'droid-commando', 'battle-droid'],
                    hand: ['wartime-trade-official'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                }
            });

            const { context } = contextRef;

            // play Tactical Droid Commander, no trigger.
            context.player1.clickCard(context.tacticalDroidCommander);

            context.player2.passAction();

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
            context.player1.clickPrompt('Choose nothing');
            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to exhaust a unit when its controller plays an opponent-owned Separatist unit with Unrefusable Offer', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['unrefusable-offer'],
                    groundArena: ['tactical-droid-commander', 'wampa']
                },
                player2: {
                    groundArena: ['super-battle-droid', 'battlefield-marine', 'atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.unrefusableOffer);
            context.player1.clickCard(context.superBattleDroid);

            context.player2.passAction();

            // defeat the Super Battle Droid and collect the Bounty to play it from player2's discard pile
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.superBattleDroid);
            expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');
            context.player1.clickPrompt('Trigger');

            expect(context.superBattleDroid).toBeInZone('groundArena', context.player1);

            // the played 3-cost Separatist unit triggers Tactical Droid Commander
            expect(context.player1).toBeAbleToSelectExactly([context.superBattleDroid, context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();
        });
    });
});
