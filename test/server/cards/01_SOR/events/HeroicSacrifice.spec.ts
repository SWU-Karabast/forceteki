describe('Heroic Sacrifice', function() {
    integration(function(contextRef) {
        describe('Heroic Sacrifice\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['heroic-sacrifice'],
                        groundArena: ['isb-agent', { card: 'wampa', exhausted: true }],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper', 'atst'],
                    }
                });
            });

            it('should draw a card and attack with a unit giving +2/+0 for this attack and defeat it after dealing combat damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.heroicSacrifice);

                expect(context.player1.handSize).toBe(1);

                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.tielnFighter]);

                context.player1.clickCard(context.isbAgent);
                expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper, context.atst, context.p2Base]);

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);
                expect(context.isbAgent).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
