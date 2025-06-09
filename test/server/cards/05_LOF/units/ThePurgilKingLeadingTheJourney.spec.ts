describe('The Purrgil King, Leading The Journey', function() {
    integration(function(contextRef) {
        it('should draw a card for each friendly unit with 7 or more remaining HP when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-purrgil-king#leading-the-journey', 'bravado'],
                    groundArena: ['battlefield-marine', 'wild-rancor'],
                    spaceArena: ['graceful-purrgil', { card: 'graceful-purrgil', damage: 4 }],
                    base: { card: 'echo-base', damage: 7 }
                },
                player2: {
                    spaceArena: ['hyperspace-wayfarer']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.thePurrgilKingLeadingTheJourney);

            // This should draw 3 cards, one for the wild-rancor, one for the king and one for the full health purrgil.
            // It should skip the damaged purrgil, the battlefield marine and the enemy hyperspace wayfarer
            expect(context.player1.handSize).toBe(1 + 3); // 1 for bravado + 3 for the card draw

            context.player2.passAction();

            // Ready a the purrgil king
            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.thePurrgilKingLeadingTheJourney);

            context.player2.passAction();

            // Attack with the purrgil king to ensure restore 4 is working
            context.player1.clickCard(context.thePurrgilKingLeadingTheJourney);
            context.player1.clickCard(context.hyperspaceWayfarer);
            expect(context.p1Base.damage).toBe(3);
        });
    });
});
