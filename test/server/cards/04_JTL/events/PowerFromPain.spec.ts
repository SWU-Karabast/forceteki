describe('Power From Pain', function() {
    integration(function(contextRef) {
        it('Power From Pain\'s ability should give a unit +1/+0 for each damage on it for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['power-from-pain'],
                    groundArena: [{ card: 'hylobon-enforcer', damage: 3 }],
                    spaceArena: ['republic-arc170']
                }
            });

            const { context } = contextRef;

            // Play the event
            context.player1.clickCard(context.powerFromPain);
            expect(context.player1).toBeAbleToSelectExactly([context.hylobonEnforcer, context.republicArc170]);
            context.player1.clickCard(context.hylobonEnforcer);
            expect(context.hylobonEnforcer.getPower()).toBe(7);

            // Reset hand state
            context.player1.moveCard(context.powerFromPain, 'hand');
            context.player2.passAction();

            // Play the event again
            context.player1.clickCard(context.powerFromPain);
            context.player1.clickCard(context.republicArc170);
            expect(context.republicArc170.getPower()).toBe(3);

            // Move to next phase
            context.moveToNextActionPhase();
            expect(context.hylobonEnforcer.getPower()).toBe(4);
            expect(context.republicArc170.getPower()).toBe(3);
        });
    });
});
