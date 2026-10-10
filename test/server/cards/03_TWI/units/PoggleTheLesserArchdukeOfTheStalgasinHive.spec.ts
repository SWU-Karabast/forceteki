describe('Poggle The Lesser, Archduke of the Stalgasin Hive', function() {
    integration(function(contextRef) {
        it('Poggle The Lesser, Archduke of the Stalgasin Hive\'s triggered ability should create a Battle Droid token if exhausted', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine', 'green-squadron-awing', 'confiscate'],
                    groundArena: ['poggle-the-lesser#archduke-of-the-stalgasin-hive'],
                    leader: 'general-grievous#general-of-the-droid-armies'
                },
                player2: {
                    hand: ['tieln-fighter']
                }
            });

            const { context } = contextRef;

            // Player plays a unit, exhaust Poggle and create a Battle Droid token
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHavePassAbilityPrompt('Exhaust this unit to create a Battle Droid token');
            context.player1.clickPrompt('Trigger');

            let battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(1);
            expect(battleDroids).toAllBeInZone('groundArena');
            expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            expect(context.poggleTheLesserArchdukeOfTheStalgasinHive.exhausted).toBe(true);

            context.readyCard(context.poggleTheLesserArchdukeOfTheStalgasinHive);

            // Opponent plays a unit, ability should not trigger
            context.player2.clickCard(context.tielnFighter);
            expect(context.poggleTheLesserArchdukeOfTheStalgasinHive.exhausted).toBe(false);
            expect(context.player1).toBeActivePlayer();

            // Player plays a unit but does not exhaust Poggle, ability should not trigger
            context.player1.clickCard(context.greenSquadronAwing);
            expect(context.player1).toHavePassAbilityPrompt('Exhaust this unit to create a Battle Droid token');
            context.player1.clickPrompt('Pass');
            expect(context.poggleTheLesserArchdukeOfTheStalgasinHive.exhausted).toBe(false);

            battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(1);

            // Player plays an event, ability should not trigger
            context.player2.passAction();
            context.player1.clickCard(context.confiscate);
            context.player1.clickPrompt('Play anyway');
            expect(context.poggleTheLesserArchdukeOfTheStalgasinHive.exhausted).toBe(false);
            expect(context.player2).toBeActivePlayer();

            // Player deploys leader, ability should not trigger
            context.player2.passAction();
            context.player1.clickCard(context.generalGrievous);
            context.player1.clickPrompt('Deploy General Grievous');

            expect(context.poggleTheLesserArchdukeOfTheStalgasinHive.exhausted).toBe(false);
            expect(context.player2).toBeActivePlayer();
        });

        it('Poggle The Lesser, Archduke of the Stalgasin Hive\'s triggered ability should trigger only for the player who plays an opponent-owned unit with Unrefusable Offer, not for its owner', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['unrefusable-offer'],
                    groundArena: ['poggle-the-lesser#archduke-of-the-stalgasin-hive', 'wampa']
                },
                player2: {
                    groundArena: ['poggle-the-lesser#archduke-of-the-stalgasin-hive', 'battlefield-marine']
                }
            });

            const { context } = contextRef;

            const p1Poggle = context.player1.findCardByName('poggle-the-lesser#archduke-of-the-stalgasin-hive');
            const p2Poggle = context.player2.findCardByName('poggle-the-lesser#archduke-of-the-stalgasin-hive');

            context.player1.clickCard(context.unrefusableOffer);
            context.player1.clickCard(context.battlefieldMarine);

            context.player2.passAction();

            // defeat the Battlefield Marine and collect the Bounty to play it from player2's discard pile
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');
            context.player1.clickPrompt('Trigger');

            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);

            expect(context.player1).toHavePassAbilityPrompt('Exhaust this unit to create a Battle Droid token');
            context.player1.clickPrompt('Trigger');

            const p1BattleDroids = context.player1.findCardsByName('battle-droid');
            expect(p1BattleDroids.length).toBe(1);
            expect(p1BattleDroids).toAllBeInZone('groundArena', context.player1);
            expect(p1Poggle.exhausted).toBeTrue();

            // the owner's Poggle did not trigger
            expect(context.player2.findCardsByName('battle-droid').length).toBe(0);
            expect(p2Poggle.exhausted).toBeFalse();
            expect(context.player2).toBeActivePlayer();
        });
    });
});
