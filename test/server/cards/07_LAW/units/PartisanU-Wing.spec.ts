describe('Partisan U-Wing', function () {
    integration(function (contextRef) {
        describe('Partisan U-Wing\'s ability', function () {
            it('should not create a Credit because no friendly was defeated this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['partisan-uwing', 'rivals-fall'],
                        credits: 0
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'wampa'],
                        credits: 1
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                context.player1.clickCard(context.partisanUwing);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.credits).toBe(0);
                expect(context.player2.credits).toBe(1);
            });

            it('should not create a Credit if a friendly Pilot was defeated as an upgrade but no unit was defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['partisan-uwing'],
                        spaceArena: [{ card: 'concord-dawn-interceptors', upgrades: ['dagger-squadron-pilot'] }]
                    },
                    player2: {
                        hand: ['confiscate'],
                        groundArena: ['battlefield-marine', 'wampa'],
                        credits: 1,
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.daggerSquadronPilot);
                context.player2.clickPrompt('Pay costs without Credit tokens');

                context.player1.clickCard(context.partisanUwing);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.credits).toBe(0);
                expect(context.player2.credits).toBe(1);
            });

            it('should create a Credit because a friendly unit was defeated this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['partisan-uwing'],
                        groundArena: ['isb-agent'],
                        credits: 0
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atat-suppressor'],
                        spaceArena: ['green-squadron-awing'],
                        credits: 1,
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.isbAgent);

                context.player1.clickCard(context.partisanUwing);

                expect(context.player1.credits).toBe(1);
                expect(context.player2.credits).toBe(1);
            });
        });
    });
});