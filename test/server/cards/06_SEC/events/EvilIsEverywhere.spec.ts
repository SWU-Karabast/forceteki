describe('Aggressive Negotiations', function () {
    integration(function (contextRef) {
        it('should initiate an attack and give the attacker +1/+0 for each card in your hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['evil-is-everywhere', 'atst'],
                    groundArena: [{ card: 'karis#we-dont-like-strangers', upgrades: ['kylo-rens-lightsaber'] }, 'wampa'],
                    spaceArena: ['avenger#hunting-star-destroyer'],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'kylo-ren#i-know-your-story']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.evilIsEverywhere);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.kyloRen, context.karis]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
        });
    });
});
