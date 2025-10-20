describe('Special Modifications', function () {
    integration(function (contextRef) {
        it('Special Modifications\'s ability should attaches only to Vehicle units and, if attached unit is a Transport, creates a Spy token (optional)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['special-modifications'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['inspectors-shuttle']
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.specialModifications);
            // Can only target Vehicles (friendly or enemy)
            expect(context.player1).toBeAbleToSelectExactly([context.inspectorsShuttle, context.atst]);

            // Attach to Transport (Inspector's Shuttle) -> create a Spy token
            context.player1.clickCard(context.inspectorsShuttle);

            expect(context.player1).toHavePassAbilityPrompt('Create a Spy token');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();

            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(1);
            expect(spies[0]).toBeInZone('groundArena');
            expect(spies[0].exhausted).toBeTrue();

            expect(context.inspectorsShuttle).toHaveExactUpgradeNames(['special-modifications']);
        });

        it('does not create a Spy token when attached to a non-Transport Vehicle', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['special-modifications'],
                    groundArena: ['atst']
                },
                player2: {
                    spaceArena: ['inspectors-shuttle']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.specialModifications);
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();

            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(0);
            expect(context.specialModifications).toBeAttachedTo(context.atst);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
