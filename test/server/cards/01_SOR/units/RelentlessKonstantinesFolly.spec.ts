describe('Relentless, Konstantine\'s Folly', function() {
    integration(function(contextRef) {
        describe('Relentless, Konstantine\'s Folly\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['relentless#konstantines-folly', 'daring-raid']
                    },
                    player2: {
                        hand: ['vanquish', 'repair', 'moment-of-peace'],
                        base: { card: 'dagobah-swamp', damage: 5 }
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should nullify the effects of the first event the opponent plays each round', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.relentless);

                // play an event, with no effect
                let exhaustedResourcesBeforeCardPlay = context.player2.exhaustedResourceCount;
                context.player2.clickCard(context.vanquish);
                expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourcesBeforeCardPlay + 5);
                expect(context.relentless).toBeInZone('spaceArena');
                expect(context.vanquish).toBeInZone('discard');

                context.player1.passAction();

                // play a second event, with effect
                exhaustedResourcesBeforeCardPlay = context.player2.exhaustedResourceCount;
                context.player2.clickCard(context.repair);
                context.player2.clickCard(context.p2Base);
                expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourcesBeforeCardPlay + 1);
                expect(context.p2Base.damage).toBe(2);

                // next round, it should nullify the first event played again
                context.moveToNextActionPhase();
                context.player1.passAction();
                exhaustedResourcesBeforeCardPlay = context.player2.exhaustedResourceCount;
                context.player2.clickCard(context.momentOfPeace);
                expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourcesBeforeCardPlay + 1);
                expect(context.relentless).toHaveExactUpgradeNames([]);
            });

            it('should not nullify a second or later event even if Relentless was played after the first event', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.repair);
                context.player2.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);

                context.player1.clickCard(context.relentless);

                expect(context.relentless).toBeInZone('spaceArena');
                context.player2.clickCard(context.vanquish);
                expect(context.relentless).toBeInZone('discard');
            });

            it('should not nullify an event played by its controller', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.relentless);

                context.player2.passAction();

                context.player1.clickCard(context.daringRaid);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.relentless]);
                expect(context.p2Base.damage).toBe(5);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(7);
            });
        });
    });
});
