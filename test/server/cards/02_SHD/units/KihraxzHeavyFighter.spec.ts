describe('Kihraxz Heavy Fighter', function () {
    integration(function (contextRef) {
        it('should gain +3 on attack if you exhaust another friendly unit and self is not selectable', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'pyke-sentinel'],
                    spaceArena: ['kihraxz-heavy-fighter']
                },
                player2: {
                    spaceArena: ['devastator#inescapable']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.kihraxzHeavyFighter);
            expect(context.player1).toBeAbleToSelectExactly(['battlefield-marine', 'pyke-sentinel']);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.devastatorInescapable.damage).toBe(6);
        });

        it('should do normal attack if no unit can be exhausted', () => {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    spaceArena: ['kihraxz-heavy-fighter']
                },
                player2: {
                    spaceArena: ['devastator#inescapable']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.kihraxzHeavyFighter);
            expect(context.devastatorInescapable.damage).toBe(3);
        });
    });
});
