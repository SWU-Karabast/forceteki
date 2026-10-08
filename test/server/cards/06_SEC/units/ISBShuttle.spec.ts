describe('ISB Shuttle', function () {
    integration(function (contextRef) {
        describe('ISB Shuttle\'s ability', function () {
            it('should not create a Spy because no friendly was defeated this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['isb-shuttle', 'rivals-fall'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'wampa']
                    }
                });

                const { context } = contextRef;

                // defeat an opponent unit
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                context.player1.clickCard(context.isbShuttle);

                // no friendly unit was defeated, so no Spy should be created
                expect(context.player2).toBeActivePlayer();
                const spies = context.player1.findCardsByName('spy');
                expect(spies.length).toBe(0);
            });

            it('should not create a Spy if a friendly Pilot was defeated as an upgrade but no unit was defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['isb-shuttle'],
                        spaceArena: [{ card: 'concord-dawn-interceptors', upgrades: ['dagger-squadron-pilot'] }]
                    },
                    player2: {
                        hand: ['confiscate'],
                        groundArena: ['battlefield-marine', 'wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.daggerSquadronPilot);

                context.player1.clickCard(context.isbShuttle);

                // no friendly unit was defeated, so Wampa should be -3/-3
                expect(context.player2).toBeActivePlayer();
                // no friendly unit was defeated, so no Spy should be created
                expect(context.player2).toBeActivePlayer();
                const spies = context.player1.findCardsByName('spy');
                expect(spies.length).toBe(0);
            });

            it('should create a Spy because a friendly unit was defeated this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['isb-shuttle'],
                        groundArena: ['isb-agent']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atat-suppressor'],
                        spaceArena: ['green-squadron-awing']
                    }
                });

                const { context } = contextRef;
                context.player1.passAction();

                // opponent defeats a friendly unit
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.isbAgent);

                // play ISB Shuttle
                context.player1.clickCard(context.isbShuttle);

                // check for spy
                const spies = context.player1.findCardsByName('spy');
                expect(spies.length).toBe(1);
                expect(spies[0].exhausted).toBeTrue();
                expect(spies[0].getPower()).toBe(0);
                expect(spies[0].getHp()).toBe(2);
            });

            it('should create a Spy because an enemy unit was taken and defeated with No Glory, Only Results', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['isb-shuttle', 'no-glory-only-results']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Wampa is defeated while player1 controls it, so it counts as a friendly unit
                context.player1.clickCard(context.noGloryOnlyResults);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player2);

                context.player2.passAction();

                context.player1.clickCard(context.isbShuttle);

                expect(context.player2).toBeActivePlayer();
                const spies = context.player1.findCardsByName('spy');
                expect(spies.length).toBe(1);
                expect(context.player2.findCardsByName('spy').length).toBe(0);
            });
        });
    });
});
