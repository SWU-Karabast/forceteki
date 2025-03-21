describe('Headhunting', function() {
    integration(function(contextRef) {
        describe('Headhunting\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['spare-the-target'],
                        groundArena: ['clone-deserter'],
                    },
                    player2: {
                        groundArena: ['hylobon-enforcer', { card: 'wampa', upgrades: ['death-mark'] }],
                        spaceArena: ['tie-bomber'],
                        leader: { card: 'the-mandalorian#sworn-to-the-creed', deployed: true, upgrades: ['top-target'] },
                    },
                });
            });

            it('can return a unit to its owner\'s hand and collect all bounties on the unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.spareTheTarget);
                expect(context.player1).toBeAbleToSelectExactly([context.hylobonEnforcer, context.wampa, context.tieBomber]);
                context.player1.clickCard(context.hylobonEnforcer);
                expect(context.player1.handSize).toBe(1);
            });
        });
    });
});
