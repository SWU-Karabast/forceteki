describe('Resolute, Under Anakin\'s Command', function () {
    integration(function (contextRef) {
        it('Resolute when played and on attack ability should deal 2 damage to an enemy unit and all enemy unit with same name and it have a 1 cost reduction for each 5 damage to our base', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['resolute#under-anakins-command'],
                    leader: 'anakin-skywalker#what-it-takes-to-win',
                    base: { card: 'echo-base', damage: 15 }
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['millennium-falcon#landos-pride', 'millennium-falcon#piece-of-junk']
                }
            });

            const { context } = contextRef;

            const falcon1 = context.player2.findCardByName('millennium-falcon#piece-of-junk');
            const falcon2 = context.player2.findCardByName('millennium-falcon#landos-pride');

            context.player1.clickCard(context.resolute);
            expect(context.player1).toBeAbleToSelectExactly([context.atst, falcon1, falcon2]);

            // choose a unit, no unit share his name, it's the only one damaged
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();

            // resolute should have 3 cost reduction due to base's damage
            expect(context.player1.exhaustedResourceCount).toBe(7);

            expect(context.atst.damage).toBe(2);
            expect(falcon1.damage).toBe(0);
            expect(falcon2.damage).toBe(0);

            context.resolute.exhausted = false;
            context.player2.passAction();

            context.player1.clickCard(context.resolute);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.atst, falcon1, falcon2]);

            // choose a unit which share name with another one, should deal damage to both
            context.player1.clickCard(falcon1);

            expect(context.player2).toBeActivePlayer();
            expect(falcon1.damage).toBe(2);
            expect(falcon2.damage).toBe(2);
        });
    });
});
