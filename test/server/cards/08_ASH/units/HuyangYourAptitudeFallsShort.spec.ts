describe('Huyang, Your Aptitude Falls Short', function() {
    integration(function(contextRef) {
        it('Huyang\'s ability should give an upgraded unit -4/-0 for this phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['huyang#your-aptitude-falls-short'],
                    spaceArena: [{ card: 'awing', upgrades: ['champion'] }]
                },
                player2: {
                    groundArena: [
                        { card: 'atst', upgrades: ['shield'] },
                        'wampa'
                    ]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.huyang);
            context.player1.clickCard(context.p2Base);

            // Can only target upgraded units
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.awing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.getPower()).toBe(2);
            expect(context.atst.getHp()).toBe(7);

            context.moveToNextActionPhase();

            expect(context.atst.getPower()).toBe(6);
            expect(context.atst.getHp()).toBe(7);
        });
    });
});
