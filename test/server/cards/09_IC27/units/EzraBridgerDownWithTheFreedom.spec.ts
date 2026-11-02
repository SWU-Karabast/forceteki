describe('Ezra Bridger, Down With the Freedom', function () {
    integration(function (contextRef) {
        it('Ezra Bridger\'s ability should give another friendly Heroism unit Raid 2 for this phase when he attacks', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ezra-bridger#down-with-the-freedom', 'battlefield-marine', 'wampa'],
                },
                player2: {
                    groundArena: ['specforce-soldier'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ezraBridger);
            context.player1.clickCard(context.p2Base);

            // Can only target other friendly Heroism units: Ezra, Wampa and the enemy Specforce Soldier are excluded
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            context.player2.passAction();

            // Battlefield Marine has Raid 2: it gets +2 power while attacking
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(8);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
        });

        it('Ezra Bridger\'s ability should do nothing if there is no other friendly Heroism unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ezra-bridger#down-with-the-freedom', 'wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ezraBridger);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
