describe('Captain Pellaeon, Plotting from the Shadows', function () {
    integration(function (contextRef) {
        it('Captain Pellaeon\'s ability should gets Raid 3 if a leader unit was defeated this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['captain-pellaeon#plotting-from-the-shadows'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                },
                player2: {
                    hasInitiative: true,
                    hand: ['rivals-fall']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.sabineWren);

            context.player1.clickCard(context.captainPellaeon);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(5);

            expect(context.captainPellaeon.getPower()).toBe(2);
            expect(context.captainPellaeon.getHp()).toBe(4);

            context.moveToNextActionPhase();

            context.player2.passAction();

            context.player1.clickCard(context.captainPellaeon);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(7);
        });

        it('Captain Pellaeon\'s ability should gets Raid 3 if an enemy leader unit was defeated this phase ', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['captain-pellaeon#plotting-from-the-shadows'],
                    hand: ['rivals-fall']
                },
                player2: {
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.sabineWren);

            context.player2.passAction();

            context.player1.clickCard(context.captainPellaeon);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(5);
        });

        it('Captain Pellaeon\'s ability should gets Raid 3 if a leader unit was defeated this phase (Darksaber leader unit)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['captain-pellaeon#plotting-from-the-shadows', { card: 'r2d2#full-of-solutions', upgrades: ['the-darksaber#icon-of-leadership'] }],
                },
                player2: {
                    hasInitiative: true,
                    hand: ['rivals-fall']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.r2d2);

            context.player1.clickCard(context.captainPellaeon);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(5);
        });

        it('Captain Pellaeon\'s ability should not gets Raid 3 if a non-leader unit was defeated this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['captain-pellaeon#plotting-from-the-shadows', 'wampa'],
                },
                player2: {
                    hasInitiative: true,
                    hand: ['rivals-fall']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.wampa);

            context.player1.clickCard(context.captainPellaeon);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(2);
        });

        it('Captain Pellaeon\'s ability should gets Raid 3 if a leader unit was defeated this phase (Pilot leader unit)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['captain-pellaeon#plotting-from-the-shadows'],
                    spaceArena: ['awing'],
                    leader: 'luke-skywalker#hero-of-yavin'
                },
                player2: {
                    hand: ['rivals-fall']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lukeSkywalker);
            context.player1.clickPrompt('Deploy Luke Skywalker as a Pilot');
            context.player1.clickCard(context.awing);

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.awing);

            context.player1.clickCard(context.captainPellaeon);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(5);
        });
    });
});