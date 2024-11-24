describe('Hunter, Outcast Sergeant', function () {
    integration(function (contextRef) {
        describe('Hunter\'s leader undeployed ability', function () {
            it('should give +1/+0 to a friendly unit when play a unit with keyword (first unit play)', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'echo#restored'],
                        spaceArena: ['millennium-falcon#piece-of-junk'],
                        resources: ['millennium-falcon#landos-pride', 'echo#restored', 'battlefield-marine', 'devotion'],
                        leader: 'hunter#outcast-sergeant',
                    },
                    player2: {
                        resources: ['echo#restored']
                    }
                });


                const { context } = contextRef;
                const set2Falcon = context.player1.findCardByName('millennium-falcon#landos-pride', 'resource');
                const resourceEcho = context.player1.findCardByName('echo#restored', 'resource');

                context.player1.clickCard(context.hunter);

                // only cards which share a name with friendly unique unit
                expect(context.player1).toBeAbleToSelectExactly([set2Falcon, resourceEcho]);
                expect(context.player1).toHaveChooseNoTargetButton();

                context.player1.clickCard(set2Falcon);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.resources.length).toBe(4);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.hunter.exhausted).toBeTrue();
                expect(set2Falcon).toBeInZone('hand');
            });
        });

        describe('Hunter\'s leader deployed ability', function () {
            it('should give +1/+0 to a friendly unit when play a unit with keyword (first unit play)', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'echo#restored'],
                        spaceArena: ['millennium-falcon#piece-of-junk'],
                        resources: ['millennium-falcon#landos-pride', 'echo#restored', 'battlefield-marine', 'devotion'],
                        leader: { card: 'hunter#outcast-sergeant', deployed: true },
                    },
                    player2: {
                        resources: ['echo#restored']
                    }
                });


                const { context } = contextRef;
                const set2Falcon = context.player1.findCardByName('millennium-falcon#landos-pride', 'resource');
                const resourceEcho = context.player1.findCardByName('echo#restored', 'resource');

                context.player1.clickCard(context.hunter);

                // only cards which share a name with friendly unique unit
                expect(context.player1).toBeAbleToSelectExactly([set2Falcon, resourceEcho]);
                expect(context.player1).toHaveChooseNoTargetButton();

                context.player1.clickCard(set2Falcon);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.resources.length).toBe(4);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.hunter.exhausted).toBeTrue();
                expect(set2Falcon).toBeInZone('hand');
            });
        });
    });
});
