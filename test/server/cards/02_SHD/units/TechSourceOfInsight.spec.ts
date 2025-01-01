describe('Tech, Source of Insight', function () {
    integration(function (contextRef) {
        describe('Tech\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        base: 'tarkintown',
                        groundArena: ['tech#source-of-insight'],
                        resources: ['wampa', 'moment-of-peace', 'battlefield-marine', 'atst', 'atst', 'atst']
                    },
                    player2: {
                        resources: ['isb-agent', 'atst', 'atst', 'atst', 'atst', 'atst'],
                    },
                });
            });

            it('should give Smuggle to all cards in the resource zone', function () {
                const { context } = contextRef;

                const reset = () => {
                    context.player1.readyResources(6);
                    context.player2.passAction();
                };

                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(6);

                // check that player2 doesn't gain smuggle
                context.player2.clickCardNonChecking(context.isbAgent);
                expect(context.isbAgent).toBeInZone('resource');

                reset();

                // TODO THIS PR: for some reason events can't gain smuggle?
                expect(context.player1.exhaustedResourceCount).toBe(0);
                context.player1.clickCard(context.momentOfPeace);
                context.player1.clickCard(context.tech);
                expect(context.tech).toHaveExactUpgradeNames(['shield']);
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });
        });
    });
});
