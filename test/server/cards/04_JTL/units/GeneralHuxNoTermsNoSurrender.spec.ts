describe('General Hux, No Terms, No Surrender', function() {
    integration(function(contextRef) {
        it('General Hux\'s ability should give Raid 1 to another first order unit and draw one card if a first order card was played this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['kijimi-patrollers'],
                    groundArena: ['general-hux#no-terms-no-surrender', 'battlefield-marine'],
                },

                player2: {
                    hand: ['kylos-tie-silencer#ruthlessly-efficient']
                }
            });

            const { context } = contextRef;

            // attack with a non first order unit, not getting raid 1
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(3);

            // opponent play a first order card, should not count for hux abilities
            context.player2.clickCard(context.kylosTieSilencer);

            // use hux ability, no first order card was played, nothing drawn
            context.player1.clickCard(context.generalHux);
            expect(context.player1).toHaveExactPromptButtons(['Draw a card', 'Attack', 'Cancel']);
            context.player1.clickPrompt('Draw a card');
            expect(context.player1.handSize).toBe(1);

            context.kylosTieSilencer.exhausted = false;
            context.player2.clickCard(context.kylosTieSilencer);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(3);

            // play a first order card
            context.player1.clickCard(context.kijimiPatrollers);
            context.player2.passAction();

            context.generalHux.exhausted = false;

            // use hux ability, a first order card was played, draw 1 card
            context.player1.clickCard(context.generalHux);
            context.player1.clickPrompt('Draw a card');
            expect(context.player1.handSize).toBe(1);

            context.player2.passAction();
            context.setDamage(context.p2Base, 0);
            context.generalHux.exhausted = false;

            // attack with hux, should not get raid 1
            context.player1.clickCard(context.generalHux);
            context.player1.clickPrompt('Attack');
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(1);

            context.setDamage(context.p2Base, 0);
            context.player2.passAction();
            context.kijimiPatrollers.exhausted = false;

            // attack with a first order unit, should get raid 1
            context.player1.clickCard(context.kijimiPatrollers);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(2);
        });
    });
});
