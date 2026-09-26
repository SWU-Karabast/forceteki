describe('Commandeered Tour Shuttle', function() {
    integration(function(contextRef) {
        it('Commandeered Tour Shuttle\'s ability should ready another unit with 3 or less power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['commandeered-tour-shuttle'],
                    groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true, exhausted: true }
                },
                player2: {
                    groundArena: [{ card: 'gungi#finding-himself', exhausted: true }]
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.commandeeredTourShuttle);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.gungi, context.cadBane]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.exhausted).toBeFalse();
            expect(context.commandeeredTourShuttle.exhausted).toBeTrue();
            expect(context.gungi.exhausted).toBeTrue();
            expect(context.cadBane.exhausted).toBeTrue();

            expect(context.player2).toBeActivePlayer();
        });

        it('Commandeered Tour Shuttle\'s ability should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['commandeered-tour-shuttle'],
                    groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true, exhausted: true }
                },
                player2: {
                    groundArena: [{ card: 'gungi#finding-himself', exhausted: true }]
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.commandeeredTourShuttle);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.gungi, context.cadBane]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.commandeeredTourShuttle.exhausted).toBeTrue();
            expect(context.gungi.exhausted).toBeTrue();
            expect(context.cadBane.exhausted).toBeTrue();

            expect(context.player2).toBeActivePlayer();
        });
    });
});