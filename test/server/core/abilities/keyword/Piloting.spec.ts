describe('Piloting keyword', function() {
    integration(function(contextRef) {
        describe('When a unit with a Piloting cost is played', function() {
            it('it can be played as a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dagger-squadron-pilot'],
                        spaceArena: ['concord-dawn-interceptors'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daggerSquadronPilot);
                // TODO: fix this
                // expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Play Dagger Squadron Pilot', 'Play Dagger Squadron Pilot with Piloting']);
                expect(context.daggerSquadronPilot).toBeInZone('groundArena');
            });

            // it('it can be played as an upgrade', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             hand: ['dagger-squadron-pilot'],
            //             spaceArena: ['concord-dawn-interceptors'],
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.daggerSquadronPilot);
            //     expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Play Dagger Squadron Pilot', 'Play Dagger Squadron Pilot with Piloting']);
            // });
        });
    });
});
