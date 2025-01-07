describe('DJ, Blatant Thief', function() {
    integration(function(contextRef) {
        describe('DJ\'s when played ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        base: 'chopper-base',
                        leader: 'han-solo#audacious-smuggler',
                        hand: ['strafing-gunship'],
                        resources: [
                            'dj#blatant-thief', 'atst', 'atst', 'atst', 'atst',
                            'atst', 'atst', 'atst', 'atst', 'atst'
                        ]
                    },
                    player2: {
                        groundArena: ['atat-suppressor'],
                        resources: 10
                    }
                });
            });

            it('should take control of a resource until he leaves play, taking a ready resource if available', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.djBlatantThief);

                expect(context.player1.resources.length).toBe(11);
                expect(context.player2.resources.length).toBe(9);
                expect(context.player1.readyResourceCount).toBe(4);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.player2.readyResourceCount).toBe(9);
                expect(context.player2.exhaustedResourceCount).toBe(0);

                // check that stolen resource maintained its ready state
                const stolenResourceList = context.player1.resources.filter((resource) => resource.owner === context.player2Object);
                expect(stolenResourceList.length).toBe(1);
                const stolenResource = stolenResourceList[0];
                expect(stolenResource.exhausted).toBeFalse();

                // confirm that player1 can spend with it
                context.player2.passAction();
                expect(context.player1.readyResourceCount).toBe(4);
                context.player1.clickCard(context.strafingGunship);
                expect(context.strafingGunship).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(11);
                expect(stolenResource.exhausted).toBeTrue();

                // DJ is defeated, resource goes back to owner's resource zone and stays exhausted
                context.player2.clickCard(context.atatSuppressor);
                context.player2.clickCard(context.dj);

                expect(context.player1.resources.length).toBe(10);
                expect(context.player2.resources.length).toBe(10);
                expect(context.player2.exhaustedResourceCount).toBe(1);
                expect(context.player2.readyResourceCount).toBe(9);
                expect(context.player1.exhaustedResourceCount).toBe(10);
                expect(context.player1.readyResourceCount).toBe(0);

                expect(stolenResource.controller).toBe(context.player2Object);
                expect(stolenResource.exhausted).toBeTrue();
            });

            it('should take control of a resource until he leaves play, taking an exhausted resource if required', function () {
                const { context } = contextRef;

                context.player2.exhaustResources(10);

                context.player1.clickCard(context.djBlatantThief);

                expect(context.player1.resources.length).toBe(11);
                expect(context.player2.resources.length).toBe(9);
                expect(context.player1.readyResourceCount).toBe(3);
                expect(context.player1.exhaustedResourceCount).toBe(8);
                expect(context.player2.readyResourceCount).toBe(0);
                expect(context.player2.exhaustedResourceCount).toBe(9);

                // check that stolen resource maintained its ready state
                const stolenResourceList = context.player1.resources.filter((resource) => resource.owner === context.player2Object);
                expect(stolenResourceList.length).toBe(1);
                const stolenResource = stolenResourceList[0];
                expect(stolenResource.exhausted).toBeTrue();

                // move to next action phase so that resources are all readied
                context.moveToNextActionPhase();

                // DJ is defeated, resource goes back to owner's resource zone and stays ready
                context.player1.passAction();
                context.player2.clickCard(context.atatSuppressor);
                context.player2.clickCard(context.dj);

                expect(context.player1.resources.length).toBe(10);
                expect(context.player2.resources.length).toBe(10);
                expect(context.player2.exhaustedResourceCount).toBe(0);
                expect(context.player2.readyResourceCount).toBe(10);
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player1.readyResourceCount).toBe(10);

                expect(stolenResource.controller).toBe(context.player2Object);
                expect(stolenResource.exhausted).toBeFalse();
            });
        });
    });
});
