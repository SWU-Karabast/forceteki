describe('HK-87 Assassin Droid', () => {
    integration(function (contextRef) {
        it('HK-87 Assassin Droid\'s when defeated ability deals 2 damage to each ground unit', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['hk87-assassin-droid', 'battlefield-marine'],
                    spaceArena: ['phoenix-squadron-awing']
                },
                player2: {
                    hand: ['takedown'],
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['green-squadron-awing'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.hk87AssassinDroid);

            expect(context.player1).toBeActivePlayer();
            expect(context.wampa.damage).toBe(2);
            expect(context.atst.damage).toBe(2);
            expect(context.battlefieldMarine.damage).toBe(2);
            expect(context.phoenixSquadronAwing.damage).toBe(0);
            expect(context.greenSquadronAwing.damage).toBe(0);
        });

        it('HK-87 Assassin Droid\'s when defeated ability deals 2 damage to each ground unit with No Glory Only Results', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['hk87-assassin-droid', 'battlefield-marine'],
                    spaceArena: ['phoenix-squadron-awing']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['green-squadron-awing'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.hk87AssassinDroid);

            expect(context.player1).toBeActivePlayer();
            expect(context.wampa.damage).toBe(2);
            expect(context.atst.damage).toBe(2);
            expect(context.battlefieldMarine.damage).toBe(2);
            expect(context.phoenixSquadronAwing.damage).toBe(0);
            expect(context.greenSquadronAwing.damage).toBe(0);
        });
    });
});