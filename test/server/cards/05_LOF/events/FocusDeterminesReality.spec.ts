describe('Focus Determines Reality', function () {
    integration(function (contextRef) {
        it('should give Raid 1 and Saboteur to each friendly Force unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['focus-determines-reality'],
                    groundArena: ['secretive-sage', 'jedi-knight', 'battlefield-marine'],
                    spaceArena: ['padawan-starfighter']
                },
                player2: {
                    groundArena: ['luke-skywalker#jedi-knight', 'niima-outpost-constables', 'wampa'],
                    base: { card: 'echo-base', damage: 12 },
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.focusDeterminesReality);
            expect(context.battlefieldMarine.hasSomeKeyword('saboteur')).toBeFalse();
            expect(context.battlefieldMarine.hasSomeKeyword('raid')).toBeFalse();
            expect(context.secretiveSage.hasSomeKeyword('saboteur')).toBeTrue();
            expect(context.secretiveSage.hasSomeKeyword('raid')).toBeTrue();
            expect(context.jediKnight.hasSomeKeyword('saboteur')).toBeTrue();
            expect(context.jediKnight.hasSomeKeyword('raid')).toBeTrue();
            expect(context.padawanStarfighter.hasSomeKeyword('saboteur')).toBeFalse();
            expect(context.padawanStarfighter.hasSomeKeyword('raid')).toBeFalse();

            // Should not give it to enemy units
            expect(context.lukeSkywalker.hasSomeKeyword('saboteur')).toBeFalse();
            expect(context.lukeSkywalker.hasSomeKeyword('raid')).toBeFalse();

            context.player2.passAction();
            context.player1.clickCard(context.secretiveSage);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.lukeSkywalker, context.niimaOutpostConstables, context.p2Base]);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(15);

            // It should stop at the end of the phase
            context.nextPhase();
            expect(context.secretiveSage.hasSomeKeyword('saboteur')).toBeFalse();
            expect(context.secretiveSage.hasSomeKeyword('raid')).toBeFalse();
        });
    });
});
