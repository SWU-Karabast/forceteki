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
            expect(context.player1).toHavePassAbilityPrompt('Exhaust this unit');
            context.player1.clickPrompt('Exhaust this unit');

            let battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(1);
            expect(battleDroids).toAllBeInZone('groundArena');
            expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            expect(context.poggleTheLesserArchdukeOfTheStalgasinHive.exhausted).toBe(true);

            context.poggleTheLesserArchdukeOfTheStalgasinHive.exhausted = false;

            // Opponent plays a unit, ability should not trigger
            context.player2.clickCard(context.tielnFighter);
            expect(context.poggleTheLesserArchdukeOfTheStalgasinHive.exhausted).toBe(false);
            expect(context.player1).toBeActivePlayer();

            // Player plays a unit but does not exhaust Poggle, ability should not trigger
            context.player1.clickCard(context.greenSquadronAwing);
            expect(context.player1).toHavePassAbilityPrompt('Exhaust this unit');
            context.player1.clickPrompt('Pass');
            expect(context.poggleTheLesserArchdukeOfTheStalgasinHive.exhausted).toBe(false);

            battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(1);

            // Player plays an event, ability should not trigger
            context.player2.passAction();
            context.player1.clickCard(context.confiscate);
            expect(context.poggleTheLesserArchdukeOfTheStalgasinHive.exhausted).toBe(false);
            expect(context.player2).toBeActivePlayer();

            // Player deploys leader, ability should not trigger
            context.player2.passAction();
            context.player1.clickCard(context.generalGrievous);
            context.player1.clickPrompt('Deploy General Grievous');

            expect(context.poggleTheLesserArchdukeOfTheStalgasinHive.exhausted).toBe(false);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
